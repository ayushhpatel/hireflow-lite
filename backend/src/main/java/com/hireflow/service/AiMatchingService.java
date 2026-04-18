package com.hireflow.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireflow.model.Application;
import com.hireflow.model.Job;
import com.hireflow.repository.ApplicationRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.net.URL;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AiMatchingService {

    private final ApplicationRepository applicationRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api.key:}")
    private String openAiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.api.model:gpt-4o-mini}")
    private String apiModel;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleApplicationCreated(PublicService.ApplicationCreatedEvent event) {
        UUID applicationId = event.applicationId();
        log.info("Starting async AI parsing for application: {}", applicationId);
        if (openAiApiKey == null || openAiApiKey.trim().isEmpty()) {
            log.warn("OPENAI_API_KEY is not set. Skipping AI analysis.");
            return;
        }

        try {
            Application app = applicationRepository.findByIdWithJob(applicationId).orElse(null);
            if (app == null) return;
            
            String resumeUrl = app.getResumeUrl();
            if (resumeUrl == null || resumeUrl.trim().isEmpty()) {
                log.info("No valid resume URL found. Skipping AI analysis for: {}", applicationId);
                return;
            }

            // 1. Extract Resume Text
            String resumeText = extractTextFromPdf(resumeUrl);
            if (resumeText == null || resumeText.length() < 50) {
                log.warn("Could not extract meaningful text from resume for: {}", applicationId);
                return;
            }

            // Limit text size to prevent massive token inflation (just in case)
            if (resumeText.length() > 15000) {
                resumeText = resumeText.substring(0, 15000);
            }

            Job job = app.getJob();
            String jobDescription = job.getDescription();
            if (jobDescription == null) jobDescription = job.getTitle();

            // 2. Query OpenAI API
            AiAnalysisResult result = queryOpenAi(jobDescription, resumeText);

            // 3. Update application and save (JSON objects are safely stringified)
            app.setMatchScore(result.getMatchScore());
            app.setStrengths(objectMapper.writeValueAsString(result.getStrengths()));
            app.setGaps(objectMapper.writeValueAsString(result.getGaps()));

            applicationRepository.save(app);
            log.info("Successfully completed AI matching for application: {}. Score: {}", applicationId, result.getMatchScore());

        } catch (Exception e) {
            log.error("AI matching fundamentally failed for application {} due to API rejection", applicationId, e);
        }
    }

    private String extractTextFromPdf(String resumeUrl) {
        try (InputStream is = new URL(resumeUrl).openStream();
             PDDocument document = PDDocument.load(is)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (Exception e) {
            log.error("Error fetching/parsing PDF from {}: {}", resumeUrl, e.getMessage());
            return null;
        }
    }

    private AiAnalysisResult queryOpenAi(String jobDescription, String resumeText) throws Exception {
        String sysPrompt = "You are an expert hiring assistant.\n" +
                "Compare the given resume with the job description thoroughly.\n" +
                "Return tightly formatted JSON matching this exact structure:\n" +
                "{\n" +
                "  \"matchScore\": (number between 0-100 indicating percentage matched),\n" +
                "  \"strengths\": [\"First prominent matching skill/strength observed\", \"Second strength\", ...],\n" +
                "  \"gaps\": [\"First missing requirement/skill\", \"Another missing requirement\", ...]\n" +
                "}";

        String userPrompt = "Job Description:\n" + jobDescription + "\n\n" +
                "Resume Text:\n" + resumeText;

        Map<String, Object> reqBody = Map.of(
                "model", apiModel,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", sysPrompt),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(reqBody, headers);

        OpenAiResponse response = restTemplate.postForObject(apiUrl, request, OpenAiResponse.class);
        if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
            String content = response.getChoices().get(0).getMessage().getContent();
            return objectMapper.readValue(content, AiAnalysisResult.class);
        }

        throw new RuntimeException("OpenAI API returned an empty or invalid mapping structure");
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OpenAiResponse {
        private List<Choice> choices;

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Choice {
            private Message message;
        }

        @Data
        @JsonIgnoreProperties(ignoreUnknown = true)
        public static class Message {
            private String content;
        }
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AiAnalysisResult {
        private Integer matchScore;
        private List<String> strengths;
        private List<String> gaps;
    }
}

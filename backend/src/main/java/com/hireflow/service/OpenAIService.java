package com.hireflow.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OpenAIService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openai.api.key:}")
    private String openAiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.api.model:gpt-4o-mini}")
    private String apiModel;

    public String getChatCompletion(String systemPrompt, String userPrompt) {
        if (openAiApiKey == null || openAiApiKey.trim().isEmpty()) {
            log.warn("OPENAI_API_KEY is not set. OpenAI chat proxy simulating a fallback response.");
            return "Thank you for that. Could you elaborate a bit more on your experience?";
        }

        try {
            Map<String, Object> reqBody = Map.of(
                    "model", apiModel,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(reqBody, headers);

            OpenAiResponse response = restTemplate.postForObject(apiUrl, request, OpenAiResponse.class);
            if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
                return response.getChoices().get(0).getMessage().getContent().trim();
            }
        } catch (Exception e) {
            log.error("Failed OpenAI Chat execution: {}", e.getMessage());
        }
        
        return "Thank you for that response. Is there anything else you'd like to highlight regarding your skills?";
    }

    public String getStructuredJsonCompletion(String systemPrompt, String userPrompt) throws Exception {
        if (openAiApiKey == null || openAiApiKey.trim().isEmpty()) {
            log.warn("OPENAI_API_KEY is not set. OpenAI proxy simulating fallback evaluation.");
            return "{ \"score\": 65, \"summary\": \"Automated fallback evaluation. Candidates require actual OpenAI API interactions to formally score confidence and abilities.\" }";
        }

        Map<String, Object> reqBody = Map.of(
                "model", apiModel,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(reqBody, headers);
        OpenAiResponse response = restTemplate.postForObject(apiUrl, request, OpenAiResponse.class);
        
        if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
            return response.getChoices().get(0).getMessage().getContent().trim();
        }
        
        throw new RuntimeException("OpenAI returned invalid or empty JSON mapping payload.");
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
}

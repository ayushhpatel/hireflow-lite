package com.hireflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hireflow.model.Application;
import com.hireflow.model.ChatMessage;
import com.hireflow.model.ChatSession;
import com.hireflow.model.ChatStatus;
import com.hireflow.repository.ApplicationRepository;
import com.hireflow.repository.ChatMessageRepository;
import com.hireflow.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class EvaluationService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ApplicationRepository applicationRepository;
    private final OpenAIService openAiService;
    private final ObjectMapper objectMapper;

    public record EvaluationEvent(UUID sessionId) {}

    @Async
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    @org.springframework.transaction.event.TransactionalEventListener(phase = org.springframework.transaction.event.TransactionPhase.AFTER_COMMIT)
    public void handleEvaluationEvent(EvaluationEvent event) {
        evaluateChatSession(event.sessionId());
    }

    public void evaluateChatSession(UUID sessionId) {
        log.info("Starting evaluation for ChatSession {}", sessionId);

        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElse(null);

        if (session == null || session.getStatus() != ChatStatus.COMPLETED) {
            log.warn("Session {} is invalid or not COMPLETED. Aborting evaluation.", sessionId);
            return;
        }

        Application application = session.getApplication();
        if (Boolean.TRUE.equals(application.getScreeningCompleted())) {
            log.info("Application {} already has screening evaluation completed.", application.getId());
            return;
        }

        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        
        // Grab max last 10 messages
        int startIdx = Math.max(0, messages.size() - 10);
        String chatHistory = messages.subList(startIdx, messages.size()).stream()
                .map(m -> m.getSender() + ": " + m.getMessage())
                .collect(Collectors.joining("\n"));

        if (chatHistory.trim().isEmpty()) {
            log.warn("Chat history is empty for session {}. Cannot evaluate.", sessionId);
            return;
        }

        String jobDesc = application.getJob().getDescription() != null ? application.getJob().getDescription() : application.getJob().getTitle();
        String gaps = application.getGaps() != null ? application.getGaps() : "None openly identified.";

        String systemPrompt = "You are a senior technical recruiter evaluating a candidate based on an interview transcript.\n\n" +
                "Job Description:\n" + jobDesc + "\n\n" +
                "Candidate Gaps Previously Identified:\n" + gaps + "\n\n" +
                "Conversation:\n" + chatHistory + "\n\n" +
                "Evaluate the candidate based on their answers.\n" +
                "Return STRICT JSON:\n" +
                "{\n" +
                "  \"score\": number between 0 and 100,\n" +
                "  \"summary\": \"Concise 2-3 sentence evaluation highlighting strengths and weaknesses\"\n" +
                "}\n\n" +
                "Scoring Guidelines:\n" +
                "- 80-100: Strong candidate, minimal gaps\n" +
                "- 60-79: Decent but has noticeable gaps\n" +
                "- 40-59: Weak, multiple gaps\n" +
                "- <40: Not suitable\n\n" +
                "Focus strictly on technical depth, clarity of answers, confidence, and coverage of missing skills. Be entirely objective.";

        try {
            // Note: Since OpenAIService currently returns generic strings, we call the JSON endpoint specifically.
            String aiResultText = openAiService.getStructuredJsonCompletion(systemPrompt, "Produce the JSON schema for this candidate.").trim();
            
            // Defensively strip markdown block if OpenAI wraps it
            if (aiResultText.startsWith("```json")) {
                aiResultText = aiResultText.substring(7).trim();
                if (aiResultText.endsWith("```")) {
                    aiResultText = aiResultText.substring(0, aiResultText.length() - 3).trim();
                }
            }
            
            EvaluationResult result = objectMapper.readValue(aiResultText, EvaluationResult.class);

            application.setScreeningScore(result.getScore());
            application.setScreeningSummary(result.getSummary());
            application.setScreeningTranscript(chatHistory);
            application.setScreeningCompleted(true);
            applicationRepository.save(application);

            log.info("Successfully evaluated Application {} with score {}", application.getId(), result.getScore());
        } catch (Exception e) {
            log.error("Failed to execute Evaluation Engine for application {}", application.getId(), e);
        }
    }

    @lombok.Data
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public static class EvaluationResult {
        private Integer score;
        private String summary;
    }
}

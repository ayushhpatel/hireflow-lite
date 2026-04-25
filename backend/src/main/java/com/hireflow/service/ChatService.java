package com.hireflow.service;

import com.hireflow.dto.ChatMessageDto;
import com.hireflow.dto.ChatReplyResponse;
import com.hireflow.dto.ChatStartResponse;
import com.hireflow.model.*;
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
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ApplicationRepository applicationRepository;
    private final OpenAIService openAiService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Transactional
    public ChatStartResponse startSession(UUID applicationId) {
        Application application = applicationRepository.findByIdWithJob(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        ChatSession session = chatSessionRepository.findByApplicationIdAndStatus(applicationId, ChatStatus.ACTIVE)
                .orElseGet(() -> {
                    ChatSession newSession = ChatSession.builder()
                            .application(application)
                            .status(ChatStatus.ACTIVE)
                            .build();
                    return chatSessionRepository.save(newSession);
                });

        // Initialize Chat AI Message directly
        String gaps = application.getGaps() != null ? application.getGaps() : "None officially identified.";
        String jobDesc = application.getJob().getDescription() != null ? application.getJob().getDescription() : application.getJob().getTitle();

        String candidateName = application.getCandidate().getName();

        String systemPrompt = "You are a technical recruiter conducting a short screening. Address the candidate by their name: " + candidateName + "\n\n" +
                "Job Description:\n" + jobDesc + "\n\n" +
                "Candidate Gaps:\n" + gaps + "\n\n" +
                "Ask ONE concise, relevant question focusing on evaluating the candidate, especially around missing skills.\n" +
                "CRITICAL INSTRUCTION: You MUST ONLY output the raw conversational question itself to the candidate. Do NOT output internal thoughts, analysis, or 'Next prompt:' headers. Just the message.\n" +
                "Be conversational and professional.";

        String aiResponseText = openAiService.getChatCompletion(systemPrompt, "Introduce yourself and ask your first question.");

        ChatMessage aiMessage = ChatMessage.builder()
                .session(session)
                .sender(MessageSender.AI)
                .message(aiResponseText)
                .build();
        chatMessageRepository.save(aiMessage);

        return ChatStartResponse.builder()
                .sessionId(session.getId())
                .firstMessage(mapToDto(aiMessage))
                .build();
    }

    @Async
    @Transactional
    public CompletableFuture<ChatReplyResponse> sendMessageAsync(UUID sessionId, String userMessageText) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
                
        if (session.getStatus() == ChatStatus.COMPLETED) {
            throw new RuntimeException("Chat Session already completed.");
        }

        // Save User Message
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .sender(MessageSender.USER)
                .message(userMessageText)
                .build();
        chatMessageRepository.save(userMessage);

        // Fetch History
        List<ChatMessage> history = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
        
        String chatHistory = history.stream()
                .map(m -> m.getSender() + ": " + m.getMessage())
                .collect(Collectors.joining("\n"));

        Application app = session.getApplication();
        String gaps = app.getGaps() != null ? app.getGaps() : "None officially identified.";
        String jobDesc = app.getJob().getDescription() != null ? app.getJob().getDescription() : app.getJob().getTitle();

        String candidateName = app.getCandidate().getName();

        String systemPrompt = "You are a technical recruiter screening " + candidateName + ".\n\n" +
                "Job Description:\n" + jobDesc + "\n\n" +
                "Candidate Gaps:\n" + gaps + "\n\n" +
                "Conversation so far:\n" + chatHistory + "\n\n" +
                "Ask the next best question to evaluate the candidate.\n" +
                "Rules:\n" +
                "- Ask only ONE question\n" +
                "- Keep it concise and natural\n" +
                "- Focus exclusively on missing skills or weak areas\n" +
                "- Do NOT repeat questions\n" +
                "- Max total questions you can ask is 3.\n" +
                "- If you have asked 3 questions, or if enough info is gathered, you MUST respond exactly with the phrase: \"Thank you, that's all for now.\"\n" +
                "- CRITICAL INSTRUCTION: You MUST ONLY output the raw conversational message itself to the candidate. Do NOT output your internal thoughts, analysis, or 'Next prompt:' headers. Output JUST the message.";

        String aiResponseText = openAiService.getChatCompletion(systemPrompt, "Analyze history and provide the next prompt or end the interview.");

        ChatMessage aiMessage = ChatMessage.builder()
                .session(session)
                .sender(MessageSender.AI)
                .message(aiResponseText)
                .build();
        chatMessageRepository.save(aiMessage);

        boolean isCompleted = aiResponseText.toLowerCase().contains("that's all for now") || aiResponseText.toLowerCase().contains("that’s all for now");
        if (isCompleted || history.size() >= 8) { // Safety cap at 8 total messages
            session.setStatus(ChatStatus.COMPLETED);
            chatSessionRepository.save(session);
            isCompleted = true;
            
            // Asynchronously dispatch pipeline evaluation strictly AFTER commit
            eventPublisher.publishEvent(new EvaluationService.EvaluationEvent(session.getId()));
        }

        ChatReplyResponse reply = ChatReplyResponse.builder()
                .message(mapToDto(aiMessage))
                .isCompleted(isCompleted)
                .build();

        return CompletableFuture.completedFuture(reply);
    }

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatHistory(UUID sessionId) {
        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private ChatMessageDto mapToDto(ChatMessage msg) {
        return ChatMessageDto.builder()
                .id(msg.getId())
                .sender(msg.getSender())
                .message(msg.getMessage())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}

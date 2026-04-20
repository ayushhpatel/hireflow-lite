package com.hireflow.controller;

import com.hireflow.dto.ChatMessageDto;
import com.hireflow.dto.ChatMessageRequest;
import com.hireflow.dto.ChatReplyResponse;
import com.hireflow.dto.ChatStartResponse;
import com.hireflow.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/start/{applicationId}")
    public ResponseEntity<ChatStartResponse> startSession(@PathVariable UUID applicationId) {
        // Safe to call synchronously to generate the first prompt
        return ResponseEntity.ok(chatService.startSession(applicationId));
    }

    @PostMapping("/message")
    public CompletableFuture<ResponseEntity<ChatReplyResponse>> sendMessage(@RequestBody ChatMessageRequest request) {
        return chatService.sendMessageAsync(request.getSessionId(), request.getMessage())
                .thenApply(ResponseEntity::ok);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<List<ChatMessageDto>> getHistory(@PathVariable UUID sessionId) {
        return ResponseEntity.ok(chatService.getChatHistory(sessionId));
    }
}

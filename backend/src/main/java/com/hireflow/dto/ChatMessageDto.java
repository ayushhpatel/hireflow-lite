package com.hireflow.dto;

import com.hireflow.model.MessageSender;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ChatMessageDto {
    private UUID id;
    private MessageSender sender;
    private String message;
    private LocalDateTime createdAt;
}

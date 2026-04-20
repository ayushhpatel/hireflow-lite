package com.hireflow.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class ChatStartResponse {
    private UUID sessionId;
    private ChatMessageDto firstMessage;
}

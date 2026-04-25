package com.hireflow.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatReplyResponse {
    private ChatMessageDto message;
    @com.fasterxml.jackson.annotation.JsonProperty("isCompleted")
    private boolean isCompleted;
}

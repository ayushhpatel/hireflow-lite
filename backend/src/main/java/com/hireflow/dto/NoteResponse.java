package com.hireflow.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NoteResponse {
    private UUID id;
    private String content;
    private LocalDateTime createdAt;
}

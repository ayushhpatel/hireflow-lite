package com.hireflow.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ApplicationAnswerDto {
    private UUID questionId;
    private String questionText;
    private String answerText;
}

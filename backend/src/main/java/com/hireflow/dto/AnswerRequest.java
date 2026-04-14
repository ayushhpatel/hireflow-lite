package com.hireflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AnswerRequest {
    @NotNull
    private UUID questionId;

    @NotBlank
    private String answerText;
}

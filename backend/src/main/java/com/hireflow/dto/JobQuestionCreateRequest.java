package com.hireflow.dto;

import com.hireflow.model.QuestionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class JobQuestionCreateRequest {
    @NotBlank
    private String questionText;
    
    @NotNull
    private QuestionType type;

    private Boolean isDealbreaker;
    private String preferredAnswer;
}

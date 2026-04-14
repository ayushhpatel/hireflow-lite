package com.hireflow.dto;

import com.hireflow.model.QuestionType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class JobQuestionDto {
    private UUID id;
    private String questionText;
    private QuestionType type;
}

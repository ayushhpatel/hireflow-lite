package com.hireflow.dto;

import com.hireflow.model.ApplicationStage;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationStageRequest {
    @NotNull(message = "Stage is required")
    private ApplicationStage stage;
}

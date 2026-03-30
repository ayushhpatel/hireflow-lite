package com.hireflow.dto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class ApplicationRequest {
    @NotNull(message = "Candidate ID is required")
    private UUID candidateId;
    
    @NotNull(message = "Job ID is required")
    private UUID jobId;
}

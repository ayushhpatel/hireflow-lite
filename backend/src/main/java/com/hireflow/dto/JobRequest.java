package com.hireflow.dto;

import com.hireflow.model.JobStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JobRequest {
    @NotBlank(message = "Title is required")
    private String title;
    
    private String department;
    
    private JobStatus status;
}

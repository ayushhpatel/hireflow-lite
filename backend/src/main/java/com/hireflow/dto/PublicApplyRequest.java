package com.hireflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class PublicApplyRequest {
    @NotNull(message = "Job ID is required")
    private UUID jobId;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email
    private String email;

    private String phone;
    private String resumeUrl;
    
    private List<AnswerRequest> answers = new ArrayList<>();
}

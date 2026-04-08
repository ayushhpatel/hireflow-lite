package com.hireflow.dto;

import com.hireflow.model.JobStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class JobResponse {
    private UUID id;
    private String title;
    private String department;
    private String description;
    private JobStatus status;
    private LocalDateTime createdAt;
}

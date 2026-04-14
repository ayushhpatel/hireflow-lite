package com.hireflow.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CandidateResponse {
    private UUID id;
    private String name;
    private String email;
    private List<String> appliedRoles;
    private LocalDateTime createdAt;
}

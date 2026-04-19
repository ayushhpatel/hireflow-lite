package com.hireflow.dto;
import com.hireflow.model.ApplicationStage;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ApplicationResponse {
    private UUID id;
    private UUID candidateId;
    private String candidateName;
    private String candidateEmail;
    private UUID jobId;
    private String jobTitle;
    private ApplicationStage stage;
    private LocalDateTime appliedAt;
    private String resumeUrl;
    private Integer matchScore;
    private Boolean isTopCandidate;
    private List<ApplicationAnswerDto> answers;
    private String strengths;
    private String gaps;
}

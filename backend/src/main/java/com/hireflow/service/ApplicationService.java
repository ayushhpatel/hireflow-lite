package com.hireflow.service;

import com.hireflow.dto.ApplicationRequest;
import com.hireflow.dto.ApplicationResponse;
import com.hireflow.dto.ApplicationAnswerDto;
import com.hireflow.model.Application;
import com.hireflow.model.ApplicationStage;
import com.hireflow.model.Candidate;
import com.hireflow.model.Job;
import com.hireflow.model.Organization;
import com.hireflow.repository.ApplicationRepository;
import com.hireflow.repository.CandidateRepository;
import com.hireflow.repository.JobRepository;
import com.hireflow.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final OrganizationRepository organizationRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForJob(UUID jobId, UUID orgId) {
        // Validate job belongs to org
        jobRepository.findByIdAndOrganizationId(jobId, orgId)
                .orElseThrow(() -> new RuntimeException("Job not found or access denied"));

        return applicationRepository.findByJobIdAndOrganizationId(jobId, orgId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForCandidate(UUID candidateId, UUID orgId) {
        candidateRepository.findByIdAndOrganizationId(candidateId, orgId)
                .orElseThrow(() -> new RuntimeException("Candidate not found or access denied"));
        
        return applicationRepository.findByCandidateIdAndOrganizationIdOrderByAppliedAtDesc(candidateId, orgId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse createApplication(ApplicationRequest request, UUID orgId) {
        Job job = jobRepository.findByIdAndOrganizationId(request.getJobId(), orgId)
                .orElseThrow(() -> new RuntimeException("Job not found or access denied"));

        Candidate candidate = candidateRepository.findByIdAndOrganizationId(request.getCandidateId(), orgId)
                .orElseThrow(() -> new RuntimeException("Candidate not found or access denied"));

        if (applicationRepository.existsByJobIdAndCandidateIdAndOrganizationId(job.getId(), candidate.getId(), orgId)) {
            throw new RuntimeException("Candidate has already applied to this job");
        }

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        Application application = Application.builder()
                .organization(org)
                .job(job)
                .candidate(candidate)
                .stage(ApplicationStage.APPLIED) // Default stage
                .build();

        Application saved = applicationRepository.save(application);
        return mapToResponse(saved);
    }

    @Transactional
    public ApplicationResponse updateApplicationStage(UUID id, ApplicationStage stage, UUID orgId) {
        Application application = applicationRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new RuntimeException("Application not found or access denied"));
        
        application.setStage(stage);
        Application saved = applicationRepository.save(application);

        // Async dispatch
        emailService.sendStatusUpdateEmail(
                application.getCandidate().getEmail(),
                application.getJob().getTitle(),
                stage.name(),
                application.getOrganization().getName()
        );

        return mapToResponse(saved);
    }

    private ApplicationResponse mapToResponse(Application app) {
        return ApplicationResponse.builder()
                .id(app.getId())
                .candidateId(app.getCandidate().getId())
                .candidateName(app.getCandidate().getName())
                .candidateEmail(app.getCandidate().getEmail())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .stage(app.getStage())
                .appliedAt(app.getAppliedAt())
                .resumeUrl(app.getResumeUrl())
                .answers(app.getAnswers() != null ? app.getAnswers().stream()
                        .map(ans -> ApplicationAnswerDto.builder()
                                .questionId(ans.getQuestion().getId())
                                .questionText(ans.getQuestion().getQuestionText())
                                .answerText(ans.getAnswerText())
                                .build())
                        .collect(Collectors.toList()) : List.of())
                .build();
    }
}

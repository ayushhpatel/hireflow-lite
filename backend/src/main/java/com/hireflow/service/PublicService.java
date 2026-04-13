package com.hireflow.service;

import com.hireflow.dto.JobResponse;
import com.hireflow.dto.PublicApplyRequest;
import com.hireflow.model.Application;
import com.hireflow.model.ApplicationStage;
import com.hireflow.model.Candidate;
import com.hireflow.model.Job;
import com.hireflow.model.JobStatus;
import com.hireflow.repository.ApplicationRepository;
import com.hireflow.repository.CandidateRepository;
import com.hireflow.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicService {

    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<JobResponse> getOpenJobs() {
        return jobRepository.findByStatusOrderByCreatedAtDesc(JobStatus.OPEN)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobResponse getJob(UUID jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
                
        if (job.getStatus() != JobStatus.OPEN) {
            throw new RuntimeException("Job is no longer open");
        }
        return mapToResponse(job);
    }

    @Transactional
    public void applyForJob(PublicApplyRequest request) {
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));
                
        if (job.getStatus() != JobStatus.OPEN) {
            throw new RuntimeException("Job is no longer open for applications");
        }

        // We bind the candidate natively to the Job's organization
        Candidate candidate = candidateRepository.findByEmailAndOrganizationId(request.getEmail(), job.getOrganization().getId())
                .orElseGet(() -> {
                    Candidate newCandidate = Candidate.builder()
                            .organization(job.getOrganization())
                            .name(request.getName())
                            .email(request.getEmail())
                            .phone(request.getPhone())
                            .resumeUrl(request.getResumeUrl())
                            .build();
                    return candidateRepository.save(newCandidate);
                });

        if (applicationRepository.existsByJobIdAndCandidateIdAndOrganizationId(job.getId(), candidate.getId(), job.getOrganization().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already applied to this job");
        }

        Application application = Application.builder()
                .organization(job.getOrganization())
                .job(job)
                .candidate(candidate)
                .stage(ApplicationStage.APPLIED)
                .build();

        applicationRepository.save(application);

        // Async dispatch
        emailService.sendApplicationReceivedEmail(
                candidate.getEmail(),
                job.getTitle(),
                job.getOrganization().getName()
        );
    }

    private JobResponse mapToResponse(Job job) {
        return JobResponse.builder()
                .id(job.getId())
                .title(job.getTitle())
                .department(job.getDepartment())
                .description(job.getDescription())
                .status(job.getStatus())
                .createdAt(job.getCreatedAt())
                .build();
    }
}

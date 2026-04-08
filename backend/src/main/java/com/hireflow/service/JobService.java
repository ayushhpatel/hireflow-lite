package com.hireflow.service;

import com.hireflow.dto.JobRequest;
import com.hireflow.dto.JobResponse;
import com.hireflow.dto.PaginatedResponse;
import com.hireflow.model.Job;
import com.hireflow.model.JobStatus;
import com.hireflow.model.Organization;
import com.hireflow.repository.JobRepository;
import com.hireflow.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {
    
    private final JobRepository jobRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public PaginatedResponse<JobResponse> getAllJobs(UUID orgId, int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Job> jobPage;
        
        if (search != null && !search.trim().isEmpty()) {
            jobPage = jobRepository.findByOrganizationIdAndTitleContainingIgnoreCase(orgId, search.trim(), pageable);
        } else {
            jobPage = jobRepository.findByOrganizationId(orgId, pageable);
        }
        
        List<JobResponse> content = jobPage.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
                
        return new PaginatedResponse<>(jobPage, content);
    }

    @Transactional(readOnly = true)
    public JobResponse getJob(UUID id, UUID orgId) {
        Job job = jobRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        return mapToResponse(job);
    }

    @Transactional
    public JobResponse createJob(JobRequest request, UUID orgId) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
                
        Job job = Job.builder()
                .organization(org)
                .title(request.getTitle())
                .department(request.getDepartment())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : JobStatus.OPEN)
                .build();
                
        Job savedJob = jobRepository.save(job);
        return mapToResponse(savedJob);
    }

    @Transactional
    public JobResponse updateJob(UUID id, JobRequest request, UUID orgId) {
        Job job = jobRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
                
        job.setTitle(request.getTitle());
        job.setDepartment(request.getDepartment());
        job.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            job.setStatus(request.getStatus());
        }
        
        Job updatedJob = jobRepository.save(job);
        return mapToResponse(updatedJob);
    }

    @Transactional
    public void deleteJob(UUID id, UUID orgId) {
        jobRepository.deleteByIdAndOrganizationId(id, orgId);
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

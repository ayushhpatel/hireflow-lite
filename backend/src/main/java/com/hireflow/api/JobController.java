package com.hireflow.api;

import com.hireflow.dto.JobRequest;
import com.hireflow.dto.JobResponse;
import com.hireflow.dto.PaginatedResponse;
import com.hireflow.security.CustomUserDetails;
import com.hireflow.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<PaginatedResponse<JobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(jobService.getAllJobs(userDetails.getOrgId(), page, size, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(jobService.getJob(id, userDetails.getOrgId()));
    }

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        JobResponse response = jobService.createJob(request, userDetails.getOrgId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobResponse> updateJob(
            @PathVariable UUID id,
            @Valid @RequestBody JobRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(jobService.updateJob(id, request, userDetails.getOrgId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable UUID id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        jobService.deleteJob(id, userDetails.getOrgId());
        return ResponseEntity.noContent().build();
    }
}

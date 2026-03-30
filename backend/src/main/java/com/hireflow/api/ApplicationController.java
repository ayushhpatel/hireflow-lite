package com.hireflow.api;

import com.hireflow.dto.ApplicationRequest;
import com.hireflow.dto.ApplicationResponse;
import com.hireflow.dto.ApplicationStageRequest;
import com.hireflow.security.CustomUserDetails;
import com.hireflow.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsForJob(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getApplicationsForJob(jobId, userDetails.getOrgId()));
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> createApplication(
            @Valid @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ApplicationResponse response = applicationService.createApplication(request, userDetails.getOrgId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/stage")
    public ResponseEntity<ApplicationResponse> updateApplicationStage(
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationStageRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(applicationService.updateApplicationStage(id, request.getStage(), userDetails.getOrgId()));
    }
}

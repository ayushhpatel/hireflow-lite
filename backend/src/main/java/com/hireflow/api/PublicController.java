package com.hireflow.api;

import com.hireflow.dto.JobResponse;
import com.hireflow.dto.PublicApplyRequest;
import com.hireflow.service.PublicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicService publicService;

    @GetMapping("/jobs")
    public ResponseEntity<List<JobResponse>> getOpenJobs() {
        return ResponseEntity.ok(publicService.getOpenJobs());
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<JobResponse> getJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(publicService.getJob(jobId));
    }

    @PostMapping("/apply")
    public ResponseEntity<Void> applyForJob(@Valid @RequestBody PublicApplyRequest request) {
        publicService.applyForJob(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}

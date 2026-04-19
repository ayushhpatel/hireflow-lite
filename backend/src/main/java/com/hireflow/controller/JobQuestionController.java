package com.hireflow.controller;

import com.hireflow.dto.JobQuestionCreateRequest;
import com.hireflow.dto.JobQuestionDto;
import com.hireflow.model.Job;
import com.hireflow.model.JobQuestion;
import com.hireflow.repository.JobQuestionRepository;
import com.hireflow.repository.JobRepository;
import com.hireflow.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/jobs/{jobId}/questions")
@RequiredArgsConstructor
public class JobQuestionController {

    private final JobQuestionRepository jobQuestionRepository;
    private final JobRepository jobRepository;

    @PostMapping
    public ResponseEntity<JobQuestionDto> addQuestion(
            @PathVariable UUID jobId,
            @Valid @RequestBody JobQuestionCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        UUID orgId = userDetails.getOrgId();

        Job job = jobRepository.findByIdAndOrganizationId(jobId, orgId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found or access denied"));

        JobQuestion question = JobQuestion.builder()
                .job(job)
                .questionText(request.getQuestionText())
                .type(request.getType())
                .isDealbreaker(request.getIsDealbreaker() != null ? request.getIsDealbreaker() : false)
                .preferredAnswer(request.getPreferredAnswer())
                .build();

        JobQuestion saved = jobQuestionRepository.save(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToDto(saved));
    }

    @GetMapping
    public ResponseEntity<List<JobQuestionDto>> getQuestions(
            @PathVariable UUID jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        UUID orgId = userDetails.getOrgId();

        jobRepository.findByIdAndOrganizationId(jobId, orgId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found or access denied"));

        List<JobQuestionDto> questions = jobQuestionRepository.findByJobId(jobId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(questions);
    }

    private JobQuestionDto mapToDto(JobQuestion question) {
        return JobQuestionDto.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .type(question.getType())
                .isDealbreaker(question.getIsDealbreaker())
                .preferredAnswer(question.getPreferredAnswer())
                .build();
    }
}

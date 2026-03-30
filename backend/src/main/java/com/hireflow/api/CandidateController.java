package com.hireflow.api;

import com.hireflow.dto.CandidateRequest;
import com.hireflow.dto.CandidateResponse;
import com.hireflow.security.CustomUserDetails;
import com.hireflow.service.CandidateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    public ResponseEntity<List<CandidateResponse>> getAllCandidates(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(candidateService.getAllCandidates(userDetails.getOrgId()));
    }

    @PostMapping
    public ResponseEntity<CandidateResponse> createCandidate(
            @Valid @RequestBody CandidateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CandidateResponse response = candidateService.createCandidate(request, userDetails.getOrgId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

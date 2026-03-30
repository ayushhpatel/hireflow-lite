package com.hireflow.api;

import com.hireflow.dto.CandidateRequest;
import com.hireflow.dto.CandidateResponse;
import com.hireflow.dto.PaginatedResponse;
import com.hireflow.security.CustomUserDetails;
import com.hireflow.service.CandidateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    public ResponseEntity<PaginatedResponse<CandidateResponse>> getAllCandidates(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(candidateService.getAllCandidates(userDetails.getOrgId(), page, size, search));
    }

    @PostMapping
    public ResponseEntity<CandidateResponse> createCandidate(
            @Valid @RequestBody CandidateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CandidateResponse response = candidateService.createCandidate(request, userDetails.getOrgId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}

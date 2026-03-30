package com.hireflow.service;

import com.hireflow.dto.CandidateRequest;
import com.hireflow.dto.CandidateResponse;
import com.hireflow.model.Candidate;
import com.hireflow.model.Organization;
import com.hireflow.repository.CandidateRepository;
import com.hireflow.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public List<CandidateResponse> getAllCandidates(UUID orgId) {
        return candidateRepository.findByOrganizationId(orgId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CandidateResponse createCandidate(CandidateRequest request, UUID orgId) {
        if (candidateRepository.existsByEmailAndOrganizationId(request.getEmail(), orgId)) {
            throw new RuntimeException("Candidate with this email already exists in the organization");
        }

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        Candidate candidate = Candidate.builder()
                .organization(org)
                .name(request.getName())
                .email(request.getEmail())
                .build();

        Candidate saved = candidateRepository.save(candidate);
        return mapToResponse(saved);
    }

    private CandidateResponse mapToResponse(Candidate candidate) {
        return CandidateResponse.builder()
                .id(candidate.getId())
                .name(candidate.getName())
                .email(candidate.getEmail())
                .createdAt(candidate.getCreatedAt())
                .build();
    }
}

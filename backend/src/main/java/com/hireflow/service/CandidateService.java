package com.hireflow.service;

import com.hireflow.dto.CandidateRequest;
import com.hireflow.dto.CandidateResponse;
import com.hireflow.dto.NoteResponse;
import com.hireflow.dto.PaginatedResponse;
import com.hireflow.model.Candidate;
import com.hireflow.model.Note;
import com.hireflow.model.Organization;
import com.hireflow.repository.CandidateRepository;
import com.hireflow.repository.NoteRepository;
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
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final OrganizationRepository organizationRepository;
    private final NoteRepository noteRepository;

    @Transactional(readOnly = true)
    public PaginatedResponse<CandidateResponse> getAllCandidates(UUID orgId, int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Candidate> candidatePage;
        
        if (search != null && !search.trim().isEmpty()) {
            candidatePage = candidateRepository.searchByOrgAndKeyword(orgId, search.trim(), pageable);
        } else {
            candidatePage = candidateRepository.findByOrganizationId(orgId, pageable);
        }
        
        List<CandidateResponse> content = candidatePage.getContent()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
                
        return new PaginatedResponse<>(candidatePage, content);
    }

    @Transactional(readOnly = true)
    public CandidateResponse getCandidateById(UUID candidateId, UUID orgId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
                
        if (!candidate.getOrganization().getId().equals(orgId)) {
            throw new RuntimeException("Candidate does not belong to your organization");
        }
        return mapToResponse(candidate);
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

    @Transactional
    public NoteResponse createNote(UUID candidateId, String content, UUID orgId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
                
        if (!candidate.getOrganization().getId().equals(orgId)) {
            throw new RuntimeException("Candidate does not belong to your organization");
        }
        
        Note note = new Note();
        note.setCandidate(candidate);
        note.setContent(content);
        
        Note saved = noteRepository.save(note);
        
        return NoteResponse.builder()
                .id(saved.getId())
                .content(saved.getContent())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<NoteResponse> getNotesByCandidate(UUID candidateId, UUID orgId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
                
        if (!candidate.getOrganization().getId().equals(orgId)) {
            throw new RuntimeException("Candidate does not belong to your organization");
        }
        
        return noteRepository.findByCandidateIdOrderByCreatedAtDesc(candidateId)
                .stream()
                .map(n -> NoteResponse.builder()
                        .id(n.getId())
                        .content(n.getContent())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private CandidateResponse mapToResponse(Candidate candidate) {
        return CandidateResponse.builder()
                .id(candidate.getId())
                .name(candidate.getName())
                .email(candidate.getEmail())
                .appliedRoles(candidate.getApplications() != null ? candidate.getApplications().stream().map(a -> a.getJob().getTitle()).collect(Collectors.toList()) : List.of())
                .createdAt(candidate.getCreatedAt())
                .build();
    }
}

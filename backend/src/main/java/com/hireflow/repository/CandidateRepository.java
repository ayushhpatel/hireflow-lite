package com.hireflow.repository;

import com.hireflow.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
    List<Candidate> findByOrganizationId(UUID organizationId);
    Optional<Candidate> findByIdAndOrganizationId(UUID id, UUID organizationId);
    boolean existsByEmailAndOrganizationId(String email, UUID organizationId);
}

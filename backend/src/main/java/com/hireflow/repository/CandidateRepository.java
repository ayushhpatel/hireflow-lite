package com.hireflow.repository;

import com.hireflow.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CandidateRepository extends JpaRepository<Candidate, UUID> {
    List<Candidate> findByOrganizationId(UUID organizationId);
    Page<Candidate> findByOrganizationId(UUID organizationId, Pageable pageable);
    
    @Query("SELECT c FROM Candidate c WHERE c.organization.id = :orgId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Candidate> searchByOrgAndKeyword(@Param("orgId") UUID orgId, @Param("search") String search, Pageable pageable);
    Optional<Candidate> findByIdAndOrganizationId(UUID id, UUID organizationId);
    boolean existsByEmailAndOrganizationId(String email, UUID organizationId);
}

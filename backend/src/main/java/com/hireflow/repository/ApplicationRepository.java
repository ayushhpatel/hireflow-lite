package com.hireflow.repository;

import com.hireflow.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByJobIdAndOrganizationId(UUID jobId, UUID organizationId);
    Optional<Application> findByIdAndOrganizationId(UUID id, UUID organizationId);
    boolean existsByJobIdAndCandidateIdAndOrganizationId(UUID jobId, UUID candidateId, UUID organizationId);
    List<Application> findByCandidateIdAndOrganizationIdOrderByAppliedAtDesc(UUID candidateId, UUID organizationId);
}

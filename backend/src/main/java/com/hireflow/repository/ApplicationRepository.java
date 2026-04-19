package com.hireflow.repository;

import com.hireflow.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByJobIdAndOrganizationId(UUID jobId, UUID organizationId);
    Optional<Application> findByIdAndOrganizationId(UUID id, UUID organizationId);
    boolean existsByJobIdAndCandidateIdAndOrganizationId(UUID jobId, UUID candidateId, UUID organizationId);
    List<Application> findByCandidateIdAndOrganizationIdOrderByAppliedAtDesc(UUID candidateId, UUID organizationId);

    @Query("SELECT a FROM Application a JOIN FETCH a.job WHERE a.id = :id")
    Optional<Application> findByIdWithJob(@Param("id") UUID id);

    @Query("SELECT a FROM Application a WHERE a.job.id = :jobId AND a.organization.id = :orgId ORDER BY a.matchScore DESC NULLS LAST")
    List<Application> findByJobIdAndOrganizationIdOrderByMatchScoreDescNullsLast(@Param("jobId") UUID jobId, @Param("orgId") UUID orgId);
}

package com.hireflow.repository;

import com.hireflow.model.Job;
import com.hireflow.model.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByOrganizationId(UUID organizationId);
    Page<Job> findByOrganizationId(UUID organizationId, Pageable pageable);
    Page<Job> findByOrganizationIdAndTitleContainingIgnoreCase(UUID organizationId, String title, Pageable pageable);
    Optional<Job> findByIdAndOrganizationId(UUID id, UUID organizationId);
    void deleteByIdAndOrganizationId(UUID id, UUID organizationId);
    List<Job> findByStatusOrderByCreatedAtDesc(JobStatus status);
}

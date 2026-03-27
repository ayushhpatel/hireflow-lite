package com.hireflow.repository;

import com.hireflow.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByOrganizationId(UUID organizationId);
    Optional<Job> findByIdAndOrganizationId(UUID id, UUID organizationId);
    void deleteByIdAndOrganizationId(UUID id, UUID organizationId);
}

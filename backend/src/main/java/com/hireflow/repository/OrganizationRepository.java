package com.hireflow.repository;

import com.hireflow.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {
}

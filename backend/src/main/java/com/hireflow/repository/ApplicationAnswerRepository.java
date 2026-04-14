package com.hireflow.repository;

import com.hireflow.model.ApplicationAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ApplicationAnswerRepository extends JpaRepository<ApplicationAnswer, UUID> {
    List<ApplicationAnswer> findByApplicationId(UUID applicationId);
}

package com.hireflow.repository;

import com.hireflow.model.JobQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface JobQuestionRepository extends JpaRepository<JobQuestion, UUID> {
    List<JobQuestion> findByJobId(UUID jobId);
}

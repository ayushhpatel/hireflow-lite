package com.hireflow.repository;

import com.hireflow.model.CandidateRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateRecommendationRepository extends JpaRepository<CandidateRecommendation, UUID> {
    List<CandidateRecommendation> findByCandidateIdOrderByMatchScoreDesc(UUID candidateId);
}

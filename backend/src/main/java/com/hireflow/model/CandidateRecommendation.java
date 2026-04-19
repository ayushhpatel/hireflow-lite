package com.hireflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "candidate_recommendations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_job_id", nullable = false)
    private Job recommendedJob;

    @Column(name = "match_score", nullable = false)
    private Integer matchScore;

    @Column(name = "reasoning", columnDefinition = "TEXT")
    private String reasoning;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}

package com.hireflow.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "applications", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"job_id", "candidate_id"})
})
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStage stage;

    @Column(name = "resume_url")
    private String resumeUrl;
    
    @Column(name = "skills")
    private String skills;

    @Builder.Default
    @Column(name = "screening_completed", nullable = false)
    private Boolean screeningCompleted = false;

    @Column(name = "screening_score")
    private Integer screeningScore;

    @Column(name = "screening_summary", columnDefinition = "TEXT")
    private String screeningSummary;

    @Column(name = "screening_transcript", columnDefinition = "TEXT")
    private String screeningTranscript;

    @CreationTimestamp
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationAnswer> answers = new ArrayList<>();

    @Column(name = "match_score")
    private Integer matchScore;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String gaps;
}

package com.hireflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "job_questions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class JobQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "question_text", nullable = false)
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Column(name = "is_dealbreaker", columnDefinition = "boolean default false")
    private Boolean isDealbreaker = false;

    @Column(name = "preferred_answer")
    private String preferredAnswer;
}

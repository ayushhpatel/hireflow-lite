package com.hireflow.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "application_answers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApplicationAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private JobQuestion question;

    @Column(name = "answer_text", nullable = false)
    private String answerText;
}

package com.hireflow.repository;

import com.hireflow.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findByCandidateIdOrderByCreatedAtDesc(UUID candidateId);
}

CREATE TABLE notes (
    id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notes_candidate_id ON notes(candidate_id);

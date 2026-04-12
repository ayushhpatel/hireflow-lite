-- Create table safely
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY,
    content TEXT NOT NULL,
    candidate_id UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='notes' AND column_name='candidate_id'
    ) THEN
        ALTER TABLE notes ADD COLUMN candidate_id UUID;
    END IF;
END $$;

-- Add foreign key if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_notes_candidate'
    ) THEN
        ALTER TABLE notes
        ADD CONSTRAINT fk_notes_candidate
        FOREIGN KEY (candidate_id)
        REFERENCES candidates(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Create index safely
CREATE INDEX IF NOT EXISTS idx_notes_candidate_id ON notes(candidate_id);
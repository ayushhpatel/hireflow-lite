ALTER TABLE applications ADD COLUMN screening_score INTEGER;
ALTER TABLE applications ADD COLUMN screening_summary TEXT;
ALTER TABLE applications ADD COLUMN screening_completed BOOLEAN DEFAULT FALSE;

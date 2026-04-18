ALTER TABLE applications
ADD COLUMN match_score INTEGER,
ADD COLUMN strengths TEXT,
ADD COLUMN gaps TEXT;

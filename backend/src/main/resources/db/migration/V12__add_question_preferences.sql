ALTER TABLE job_questions ADD COLUMN is_dealbreaker BOOLEAN DEFAULT FALSE;
ALTER TABLE job_questions ADD COLUMN preferred_answer VARCHAR(255);

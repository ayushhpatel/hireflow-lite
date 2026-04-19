CREATE TABLE candidate_recommendations (
    id UUID PRIMARY KEY,
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    recommended_job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL,
    reasoning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

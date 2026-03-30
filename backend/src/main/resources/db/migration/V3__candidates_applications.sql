-- Alter candidates to match requested layout
ALTER TABLE candidates RENAME COLUMN first_name TO name;
ALTER TABLE candidates DROP COLUMN last_name;

-- Ensure candidate email is unique per organization
ALTER TABLE candidates ADD CONSTRAINT uk_candidate_email_org UNIQUE (org_id, email);

-- Alter applications to implicitly carry organization explicitly referencing org
ALTER TABLE applications ADD COLUMN org_id UUID REFERENCES organizations(id);

-- Update existing applications with the org_id from their associated jobs
UPDATE applications a SET org_id = j.org_id FROM jobs j WHERE a.job_id = j.id;

-- Now make the org_id NOT NULL if desired (optional but good practice)
ALTER TABLE applications ALTER COLUMN org_id SET NOT NULL;

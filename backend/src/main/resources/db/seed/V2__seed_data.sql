-- Seed Data for Dev Profile

INSERT INTO organizations (id, name) VALUES 
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Acme Corp');

INSERT INTO users (id, org_id, name, email, password_hash, role) VALUES 
('11111111-2222-3333-4444-555555555555', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Alice Admin', 'alice@acme.com', '$2a$10$xyz', 'ADMIN'),
('22222222-3333-4444-5555-666666666666', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Bob Recruiter', 'bob@acme.com', '$2a$10$xyz', 'RECRUITER');

INSERT INTO jobs (id, org_id, title, department, status) VALUES 
('33333333-4444-5555-6666-777777777777', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Senior Backend Engineer', 'Engineering', 'OPEN'),
('44444444-5555-6666-7777-888888888888', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Product Manager', 'Product', 'OPEN');

INSERT INTO candidates (id, org_id, first_name, last_name, email, phone) VALUES 
('55555555-6666-7777-8888-999999999999', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Charlie', 'Candidate', 'charlie@email.com', '555-0100');

INSERT INTO applications (id, job_id, candidate_id, stage) VALUES
('66666666-7777-8888-9999-000000000000', '33333333-4444-5555-6666-777777777777', '55555555-6666-7777-8888-999999999999', 'APPLIED');

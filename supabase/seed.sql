-- ================================================================
-- ISHA VIBES // SEED DATA (Departments & Administrative Seed Accounts)
-- ================================================================

-- Seed Initial Departments
INSERT INTO departments (id, name, color, description)
VALUES
  ('dept-teacher', 'Teacher', '#c79016', 'Faculty mentors, project supervisors, and educational guides.'),
  ('dept-hosts', 'Hosts', '#883e66', 'Voice talents, interviewers, and student presenters.'),
  ('dept-research', 'Research', '#3e6688', 'Topic investigation, fact-checking, and scriptwriting.'),
  ('dept-editing', 'Editing', '#b45f06', 'Audio mastering, music scoring, and post-production.'),
  ('dept-admin', 'Admin', '#883712', 'Executive management, publishing schedule, and portal administration.')
ON CONFLICT (name) DO UPDATE 
SET color = EXCLUDED.color, description = EXCLUDED.description;

-- Seed Lead Administrative & Faculty Accounts
INSERT INTO authorized_users (id, username, name, role, department, password, notes, is_greenlit)
VALUES
  ('AUTH-admin', 'admin', 'Lead Admin', 'Admin', 'Admin', 'Cardinal@2026', 'Master Studio Administrator', true),
  ('AUTH-raghav', 'raghav', 'Raghav', 'Admin', 'Admin', 'raghav', 'Admin - Raghav', true),
  ('AUTH-teacher', 'teacher', 'Faculty Mentor', 'Teacher', 'Teacher', 'teacher2026', 'Faculty Supervisor', true),
  ('AUTH-maya', 'maya', 'Maya Patel', 'Member', 'Hosts', 'vibes2026', 'Season 1 Co-Host', true),
  ('AUTH-aarav', 'aarav', 'Aarav Sharma', 'Member', 'Editing', 'vibes2026', 'Post-Production Lead', true)
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password, role = EXCLUDED.role, department = EXCLUDED.department, is_greenlit = EXCLUDED.is_greenlit;

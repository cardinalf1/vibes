-- ================================================================
-- ISHA VIBES // CLEAN DATABASE RESET & SETUP SCRIPT
-- Project: CARDINAL :: OVERTURE (Isha Vibes Edition)
-- ================================================================

-- 1. Clean up any previous tables & publications safely
DROP TABLE IF EXISTS account_requests CASCADE;
DROP TABLE IF EXISTS news_updates CASCADE;
DROP TABLE IF EXISTS expenditures CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS authorized_users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 2. Create Core Tables
CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  lead_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE authorized_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'Member',
  department TEXT NOT NULL DEFAULT 'Research',
  password TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_greenlit BOOLEAN DEFAULT TRUE
);

CREATE TABLE episodes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  target_release_date DATE NOT NULL,
  status TEXT NOT NULL,
  hosts TEXT,
  guest_name TEXT,
  runtime_minutes INTEGER,
  notes TEXT,
  department_notes TEXT,
  audio_url TEXT,
  audio_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE nodes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium',
  planned_start DATE NOT NULL,
  planned_end DATE NOT NULL,
  actual_start DATE,
  actual_end DATE,
  dependency TEXT,
  assigned_to TEXT,
  assigned_name TEXT
);

CREATE TABLE expenditures (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  cost NUMERIC NOT NULL,
  category TEXT NOT NULL,
  needed_by DATE NOT NULL,
  status TEXT DEFAULT 'Pending',
  pledged_by_username TEXT,
  pledged_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE news_updates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT DEFAULT 'Announcement'
);

CREATE TABLE account_requests (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Disable Row Level Security (Guarantees instant reads and writes without permission blocks)
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE nodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenditures DISABLE ROW LEVEL SECURITY;
ALTER TABLE news_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE account_requests DISABLE ROW LEVEL SECURITY;

-- 4. Seed Initial Departments
INSERT INTO departments (id, name, color, description)
VALUES
  ('dept-teacher', 'Teacher', '#c79016', 'Faculty mentors, project supervisors, and educational guides.'),
  ('dept-hosts', 'Hosts', '#883e66', 'Voice talents, interviewers, and student presenters.'),
  ('dept-research', 'Research', '#3e6688', 'Topic investigation, fact-checking, and scriptwriting.'),
  ('dept-editing', 'Editing', '#b45f06', 'Audio mastering, music scoring, and post-production.'),
  ('dept-admin', 'Admin', '#883712', 'Executive management, publishing schedule, and portal administration.');

-- 5. Seed Lead Administrative & Student Accounts
INSERT INTO authorized_users (id, username, name, role, department, password, notes, is_greenlit)
VALUES
  ('AUTH-admin', 'admin', 'Lead Admin', 'Admin', 'Admin', 'Cardinal@2026', 'Master Studio Administrator', true),
  ('AUTH-raghav', 'raghav', 'Raghav', 'Admin', 'Admin', 'raghav', 'Admin - Raghav', true),
  ('AUTH-teacher', 'teacher', 'Faculty Mentor', 'Teacher', 'Teacher', 'teacher2026', 'Faculty Supervisor', true),
  ('AUTH-maya', 'maya', 'Maya Patel', 'Member', 'Hosts', 'vibes2026', 'Season 1 Co-Host', true),
  ('AUTH-aarav', 'aarav', 'Aarav Sharma', 'Member', 'Editing', 'vibes2026', 'Post-Production Lead', true);

-- 6. Seed Initial Podcast Episodes
INSERT INTO episodes (id, title, target_release_date, status, hosts, guest_name, runtime_minutes, notes)
VALUES
  ('EP-01', 'Ep 01 // The Kickoff: Why Student Voices Matter', '2026-09-15', 'Recording', 'Maya & Aarav', 'Principal Sharma', 28, 'Pilot episode covering campus innovations and student stories.'),
  ('EP-02', 'Ep 02 // Engineering the Future: F1, AI & Code', '2026-09-22', 'Scripting', 'Maya Patel', 'Dr. Alok Verma', 35, 'Deep dive into youth STEM competitions, robotics, and creative coding.'),
  ('EP-03', 'Ep 03 // Art, Acoustics & Sonic Spaces', '2026-09-29', 'Idea', 'Aarav Sharma', 'Studio Sound Engineer', 30, 'Behind-the-scenes of studio acoustic mastering and sound design.');

-- 7. Seed Initial Production Tasks (Gantt Milestones)
INSERT INTO nodes (id, title, description, department, status, priority, planned_start, planned_end)
VALUES
  ('TSK-101', 'Season 1 Curriculum & Episode Themes', 'Lock in 6 episode topics and guest invites with faculty mentor.', 'Teacher', 'Completed', 'High', '2026-09-01', '2026-09-05'),
  ('TSK-102', 'Studio B Acoustic Soundproofing Setup', 'Install acoustic foam diffusers and position vocal shield mics.', 'Editing', 'Completed', 'Critical', '2026-09-03', '2026-09-08'),
  ('TSK-103', 'Episode 01 Research & Talking Points Outline', 'Draft 5 primary interview question clusters and fact checks.', 'Research', 'In Progress', 'High', '2026-09-06', '2026-09-11'),
  ('TSK-104', 'Episode 01 Dry Run & Mic Testing', 'Dry-run voice levels and multitrack interface gain staging.', 'Hosts', 'To Do', 'Medium', '2026-09-10', '2026-09-13'),
  ('TSK-105', 'Episode 01 Live Recording Session', 'Studio recording session with faculty guest.', 'Hosts', 'To Do', 'Critical', '2026-09-14', '2026-09-15'),
  ('TSK-106', 'Episode 01 Audio Post-Production & Mixing', 'Noise removal, compression, EQ, theme music intro/outro.', 'Editing', 'To Do', 'High', '2026-09-16', '2026-09-19'),
  ('TSK-107', 'Faculty Review & Publishing Distribution', 'Final review by faculty mentor and release to broadcast channels.', 'Admin', 'To Do', 'Critical', '2026-09-20', '2026-09-22');

-- 8. Seed Initial Studio Budget Items
INSERT INTO expenditures (id, item_name, cost, category, needed_by, status)
VALUES
  ('EXP-101', 'Shure SM7B Dynamic Vocal Microphone (2x Units)', 72000, 'Equipment', '2026-09-10', 'Purchased'),
  ('EXP-102', 'Focusrite Scarlett 4i4 USB Audio Interface', 21500, 'Equipment', '2026-09-12', 'Purchased'),
  ('EXP-103', 'Acoustic Foam Soundproofing Panels (Studio B)', 14500, 'Studio & Acoustic', '2026-09-15', 'Purchased'),
  ('EXP-104', 'Descript & Adobe Audition Annual Education Licences', 18000, 'Software & Subscriptions', '2026-09-20', 'Pending');

-- 9. Realtime Publication Setup (Safe block)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE departments, authorized_users, episodes, nodes, expenditures, news_updates, account_requests;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN others THEN NULL;
  END;
END $$;

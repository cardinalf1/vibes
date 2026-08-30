-- ================================================================
-- ISHA VIBES // INITIAL SCHEMA MIGRATION
-- Project: CARDINAL :: OVERTURE (Isha Vibes Edition)
-- ================================================================

-- 1. Create Core Tables
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  lead_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authorized_users (
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

CREATE TABLE IF NOT EXISTS episodes (
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

CREATE TABLE IF NOT EXISTS nodes (
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

CREATE TABLE IF NOT EXISTS expenditures (
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

CREATE TABLE IF NOT EXISTS news_updates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT DEFAULT 'Announcement'
);

CREATE TABLE IF NOT EXISTS account_requests (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row-Level Security (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_requests ENABLE ROW LEVEL SECURITY;

-- 3. Security Policies (Permits collaborative student & faculty access)
CREATE POLICY "Public Read Departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public Write Departments" ON departments FOR ALL USING (true);

CREATE POLICY "Public Read Authorized" ON authorized_users FOR SELECT USING (true);
CREATE POLICY "Public Write Authorized" ON authorized_users FOR ALL USING (true);

CREATE POLICY "Public Read Episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Public Write Episodes" ON episodes FOR ALL USING (true);

CREATE POLICY "Public Read Nodes" ON nodes FOR SELECT USING (true);
CREATE POLICY "Public Write Nodes" ON nodes FOR ALL USING (true);

CREATE POLICY "Public Read Expenditures" ON expenditures FOR SELECT USING (true);
CREATE POLICY "Public Write Expenditures" ON expenditures FOR ALL USING (true);

CREATE POLICY "Public Read News" ON news_updates FOR SELECT USING (true);
CREATE POLICY "Public Write News" ON news_updates FOR ALL USING (true);

CREATE POLICY "Public request inserts" ON account_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated request controls" ON account_requests FOR ALL USING (true);

-- 4. Enable Supabase Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE departments;
ALTER PUBLICATION supabase_realtime ADD TABLE authorized_users;
ALTER PUBLICATION supabase_realtime ADD TABLE episodes;
ALTER PUBLICATION supabase_realtime ADD TABLE nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE expenditures;
ALTER PUBLICATION supabase_realtime ADD TABLE news_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE account_requests;

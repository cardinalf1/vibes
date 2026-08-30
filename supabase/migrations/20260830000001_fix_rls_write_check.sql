-- ================================================================
-- ISHA VIBES // RLS PERMISSION ENHANCEMENT
-- Ensures INSERT, UPDATE, DELETE are unconditionally permitted
-- ================================================================

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Public Read Departments" ON departments;
DROP POLICY IF EXISTS "Public Write Departments" ON departments;
DROP POLICY IF EXISTS "Public Insert Departments" ON departments;
DROP POLICY IF EXISTS "Public Update Departments" ON departments;
DROP POLICY IF EXISTS "Public Delete Departments" ON departments;

DROP POLICY IF EXISTS "Public Read Authorized" ON authorized_users;
DROP POLICY IF EXISTS "Public Write Authorized" ON authorized_users;
DROP POLICY IF EXISTS "Public Insert Authorized" ON authorized_users;
DROP POLICY IF EXISTS "Public Update Authorized" ON authorized_users;
DROP POLICY IF EXISTS "Public Delete Authorized" ON authorized_users;

DROP POLICY IF EXISTS "Public Read Episodes" ON episodes;
DROP POLICY IF EXISTS "Public Write Episodes" ON episodes;
DROP POLICY IF EXISTS "Public Insert Episodes" ON episodes;
DROP POLICY IF EXISTS "Public Update Episodes" ON episodes;
DROP POLICY IF EXISTS "Public Delete Episodes" ON episodes;

DROP POLICY IF EXISTS "Public Read Nodes" ON nodes;
DROP POLICY IF EXISTS "Public Write Nodes" ON nodes;
DROP POLICY IF EXISTS "Public Insert Nodes" ON nodes;
DROP POLICY IF EXISTS "Public Update Nodes" ON nodes;
DROP POLICY IF EXISTS "Public Delete Nodes" ON nodes;

DROP POLICY IF EXISTS "Public Read Expenditures" ON expenditures;
DROP POLICY IF EXISTS "Public Write Expenditures" ON expenditures;
DROP POLICY IF EXISTS "Public Insert Expenditures" ON expenditures;
DROP POLICY IF EXISTS "Public Update Expenditures" ON expenditures;
DROP POLICY IF EXISTS "Public Delete Expenditures" ON expenditures;

DROP POLICY IF EXISTS "Public Read News" ON news_updates;
DROP POLICY IF EXISTS "Public Write News" ON news_updates;
DROP POLICY IF EXISTS "Public Insert News" ON news_updates;
DROP POLICY IF EXISTS "Public Update News" ON news_updates;
DROP POLICY IF EXISTS "Public Delete News" ON news_updates;

DROP POLICY IF EXISTS "Public request inserts" ON account_requests;
DROP POLICY IF EXISTS "Authenticated request controls" ON account_requests;
DROP POLICY IF EXISTS "Public Read Requests" ON account_requests;
DROP POLICY IF EXISTS "Public Insert Requests" ON account_requests;
DROP POLICY IF EXISTS "Public Update Requests" ON account_requests;
DROP POLICY IF EXISTS "Public Delete Requests" ON account_requests;

-- 2. Create Explicit RLS Policies with WITH CHECK (true)

-- Departments
CREATE POLICY "Public Read Departments" ON departments FOR SELECT USING (true);
CREATE POLICY "Public Insert Departments" ON departments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Departments" ON departments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Departments" ON departments FOR DELETE USING (true);

-- Authorized Users
CREATE POLICY "Public Read Authorized" ON authorized_users FOR SELECT USING (true);
CREATE POLICY "Public Insert Authorized" ON authorized_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Authorized" ON authorized_users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Authorized" ON authorized_users FOR DELETE USING (true);

-- Episodes
CREATE POLICY "Public Read Episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Public Insert Episodes" ON episodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Episodes" ON episodes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Episodes" ON episodes FOR DELETE USING (true);

-- Nodes
CREATE POLICY "Public Read Nodes" ON nodes FOR SELECT USING (true);
CREATE POLICY "Public Insert Nodes" ON nodes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Nodes" ON nodes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Nodes" ON nodes FOR DELETE USING (true);

-- Expenditures
CREATE POLICY "Public Read Expenditures" ON expenditures FOR SELECT USING (true);
CREATE POLICY "Public Insert Expenditures" ON expenditures FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Expenditures" ON expenditures FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Expenditures" ON expenditures FOR DELETE USING (true);

-- News Updates
CREATE POLICY "Public Read News" ON news_updates FOR SELECT USING (true);
CREATE POLICY "Public Insert News" ON news_updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update News" ON news_updates FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete News" ON news_updates FOR DELETE USING (true);

-- Account Requests
CREATE POLICY "Public Read Requests" ON account_requests FOR SELECT USING (true);
CREATE POLICY "Public Insert Requests" ON account_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Requests" ON account_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public Delete Requests" ON account_requests FOR DELETE USING (true);

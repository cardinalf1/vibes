import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Upload, Copy, Check, Database, Sparkles, Terminal } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  simulatedDate: string;
  onDateChange: (newDate: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  currentRole, 
  simulatedDate, 
  onDateChange,
  onExport,
  onImport
}: SettingsModalProps) {
  const [dateInput, setDateInput] = useState(simulatedDate);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    setDateInput(simulatedDate);
  }, [simulatedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDateChange(dateInput);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sqlScript = `-- ==========================================
-- ISHA VIBES // SUPABASE DATABASE SETUP SCRIPT
-- Project: CARDINAL :: OVERTURE (Isha Vibes Edition)
-- ==========================================

-- 1. Create Core Tables
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  lead_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS authorized_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
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
  pledged_by_email TEXT,
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
  email TEXT UNIQUE NOT NULL,
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

-- 3. Drop existing policies
DROP POLICY IF EXISTS "Public Read Departments" ON departments;
DROP POLICY IF EXISTS "Public Write Departments" ON departments;
DROP POLICY IF EXISTS "Public Read Authorized" ON authorized_users;
DROP POLICY IF EXISTS "Public Write Authorized" ON authorized_users;
DROP POLICY IF EXISTS "Public Read Episodes" ON episodes;
DROP POLICY IF EXISTS "Public Write Episodes" ON episodes;
DROP POLICY IF EXISTS "Public Read Nodes" ON nodes;
DROP POLICY IF EXISTS "Public Write Nodes" ON nodes;
DROP POLICY IF EXISTS "Public Read Expenditures" ON expenditures;
DROP POLICY IF EXISTS "Public Write Expenditures" ON expenditures;
DROP POLICY IF EXISTS "Public Read News" ON news_updates;
DROP POLICY IF EXISTS "Public Write News" ON news_updates;
DROP POLICY IF EXISTS "Public request inserts" ON account_requests;
DROP POLICY IF EXISTS "Authenticated request controls" ON account_requests;

-- 4. Create open write policies (Permits student & teacher writes)
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

-- 5. Seed Initial Departments
INSERT INTO departments (id, name, color, description)
VALUES
  ('dept-teacher', 'Teacher', '#c79016', 'Faculty mentors, project supervisors, and educational guides.'),
  ('dept-hosts', 'Hosts', '#883e66', 'Voice talents, interviewers, and student presenters.'),
  ('dept-research', 'Research', '#3e6688', 'Topic investigation, fact-checking, and scriptwriting.'),
  ('dept-editing', 'Editing', '#b45f06', 'Audio mastering, music scoring, and post-production.'),
  ('dept-admin', 'Admin', '#883712', 'Executive management, publishing schedule, and portal administration.')
ON CONFLICT (name) DO NOTHING;

-- 6. Seed Lead Administrative & Faculty Accounts
INSERT INTO authorized_users (id, email, name, role, department, password, notes, is_greenlit)
VALUES
  ('AUTH-admin', 'contact@cardinalsystems.org', 'Lead Admin', 'Admin', 'Admin', 'Cardinal@2026', 'Master Studio Administrator', true),
  ('AUTH-raghav', 'raghav@cardinalsystems.org', 'Raghav', 'Admin', 'Admin', 'raghav', 'Admin - Raghav', true),
  ('AUTH-teacher', 'teacher@cardinalsystems.org', 'Faculty Mentor', 'Teacher', 'Teacher', 'teacher2026', 'Faculty Supervisor', true)
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password, role = EXCLUDED.role, department = EXCLUDED.department, is_greenlit = EXCLUDED.is_greenlit;

-- 7. Enable Supabase Realtime Replication
ALTER PUBLICATION supabase_realtime ADD TABLE departments;
ALTER PUBLICATION supabase_realtime ADD TABLE authorized_users;
ALTER PUBLICATION supabase_realtime ADD TABLE episodes;
ALTER PUBLICATION supabase_realtime ADD TABLE nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE expenditures;
ALTER PUBLICATION supabase_realtime ADD TABLE news_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE account_requests;
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-[#222b3d] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#222b3d] bg-[#161b26] flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-white font-sans uppercase">Studio & Database Settings</h2>
            <p className="text-xs text-slate-400 mt-0.5">Isha Vibes Workspace Configuration</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Simulated Time Engine */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Simulated Studio Date (Gantt 'Today' Reference)
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateInput}
                onChange={e => setDateInput(e.target.value)}
                className="flex-1 bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#3e6688] hover:bg-[#4d7ca6] text-white rounded-xl text-xs font-medium cursor-pointer"
              >
                Set Date
              </button>
            </div>
          </form>

          {/* Backup & Restore */}
          <div className="space-y-3 pt-4 border-t border-[#222b3d]">
            <label className="text-xs font-semibold text-slate-300 block">Workspace State Backup</label>
            <div className="flex gap-3">
              <button
                onClick={onExport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#181e2b] hover:bg-[#222b3d] text-slate-200 border border-[#222b3d] rounded-xl text-xs font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export JSON State
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#181e2b] hover:bg-[#222b3d] text-slate-200 border border-[#222b3d] rounded-xl text-xs font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Restore JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Supabase SQL Setup Section */}
          <div className="space-y-3 pt-4 border-t border-[#222b3d]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#c79016]" />
                <label className="text-xs font-semibold text-white">Supabase SQL Editor Script</label>
              </div>
              <button
                type="button"
                onClick={() => setShowSql(!showSql)}
                className="text-xs text-[#9dbcd4] hover:text-white"
              >
                {showSql ? 'Hide SQL' : 'View SQL Script'}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Run this turnkey script inside your new Supabase project SQL Editor to create all 7 tables, policies, default departments, and admin accounts.
            </p>

            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c79016] hover:bg-[#d89e1a] text-black font-semibold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'SQL COPIED TO CLIPBOARD!' : 'COPY SQL SETUP SCRIPT'}
            </button>

            {showSql && (
              <pre className="bg-[#0b0e14] text-[10px] text-slate-300 font-mono p-4 rounded-xl border border-[#222b3d] max-h-60 overflow-y-auto whitespace-pre">
                {sqlScript}
              </pre>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-[#222b3d] bg-[#161b26] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-slate-300 bg-[#181e2b] hover:bg-[#20283a] border border-[#222b3d] rounded-xl"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
}

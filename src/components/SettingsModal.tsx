import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Upload, Copy, Check, Database, Sparkles, Terminal, Link, Key, AlertCircle } from 'lucide-react';
import { supabaseUrl as currentUrl, supabaseAnonKey as currentKey, saveSupabaseConfig } from '../lib/supabase';

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

  // Supabase Connection State
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [keyInput, setKeyInput] = useState(currentKey || '');
  const [connectionSaved, setConnectionSaved] = useState(false);

  useEffect(() => {
    setDateInput(simulatedDate);
    setUrlInput(currentUrl || '');
    setKeyInput(currentKey || '');
  }, [simulatedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDateChange(dateInput);
    onClose();
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(urlInput.trim(), keyInput.trim());
    setConnectionSaved(true);
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

-- 3. Open Access Policies
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

-- 4. Seed Initial Departments
INSERT INTO departments (id, name, color, description)
VALUES
  ('dept-teacher', 'Teacher', '#c79016', 'Faculty mentors, project supervisors, and educational guides.'),
  ('dept-hosts', 'Hosts', '#883e66', 'Voice talents, interviewers, and student presenters.'),
  ('dept-research', 'Research', '#3e6688', 'Topic investigation, fact-checking, and scriptwriting.'),
  ('dept-editing', 'Editing', '#b45f06', 'Audio mastering, music scoring, and post-production.'),
  ('dept-admin', 'Admin', '#883712', 'Executive management, publishing schedule, and portal administration.')
ON CONFLICT (name) DO NOTHING;

-- 5. Seed Lead Administrative & Faculty Accounts
INSERT INTO authorized_users (id, username, name, role, department, password, notes, is_greenlit)
VALUES
  ('AUTH-admin', 'admin', 'Lead Admin', 'Admin', 'Admin', 'Cardinal@2026', 'Master Studio Administrator', true),
  ('AUTH-raghav', 'raghav', 'Raghav', 'Admin', 'Admin', 'raghav', 'Admin - Raghav', true),
  ('AUTH-teacher', 'teacher', 'Faculty Mentor', 'Teacher', 'Teacher', 'teacher2026', 'Faculty Supervisor', true),
  ('AUTH-maya', 'maya', 'Maya Patel', 'Member', 'Hosts', 'vibes2026', 'Season 1 Co-Host', true),
  ('AUTH-aarav', 'aarav', 'Aarav Sharma', 'Member', 'Editing', 'vibes2026', 'Post-Production Lead', true)
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password, role = EXCLUDED.role, department = EXCLUDED.department, is_greenlit = EXCLUDED.is_greenlit;

-- 6. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE departments;
ALTER PUBLICATION supabase_realtime ADD TABLE authorized_users;
ALTER PUBLICATION supabase_realtime ADD TABLE episodes;
ALTER PUBLICATION supabase_realtime ADD TABLE nodes;
ALTER PUBLICATION supabase_realtime ADD TABLE expenditures;
ALTER PUBLICATION supabase_realtime ADD TABLE news_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE account_requests;`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-[#222b3d] rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#222b3d] bg-[#161b26] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3e6688]/20 border border-[#3e6688]/40 flex items-center justify-center text-[#9dbcd4]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Studio Settings & Supabase Connection
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Configure live database connection and timeline parameters
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Supabase Connection Setup */}
          <div className="bg-[#0b0e14] border border-[#222b3d] rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-[#3e6688]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Supabase Cloud Connection
                </h4>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                currentUrl && currentKey 
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                  : 'bg-amber-950/40 text-amber-300 border-amber-800/40'
              }`}>
                {currentUrl && currentKey ? '● CONNECTED' : '○ DISCONNECTED'}
              </span>
            </div>

            <form onSubmit={handleSaveConnection} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Project URL (From Supabase Project Settings ➔ API)
                </label>
                <input
                  type="text"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://xyzabcdef.supabase.co"
                  className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#3e6688]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  Anon / Public API Key
                </label>
                <input
                  type="password"
                  required
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="sb_publishable_... or eyJhbGci..."
                  className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#3e6688]"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3e6688] hover:bg-[#4d7ca6] text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Save & Connect Live Database
                </button>
              </div>
            </form>
          </div>

          {/* Database Setup Script Viewer */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-300 block">
                Database Migration SQL Script
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSql(!showSql)}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 bg-[#181e2b] border border-[#222b3d] rounded-lg cursor-pointer"
                >
                  {showSql ? 'Hide SQL' : 'View SQL Script'}
                </button>
                <button
                  onClick={copySql}
                  className="text-xs text-black font-semibold px-2.5 py-1 bg-[#c79016] hover:bg-[#d89e1a] rounded-lg flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Script'}</span>
                </button>
              </div>
            </div>

            {showSql && (
              <pre className="p-4 bg-[#0b0e14] border border-[#222b3d] rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto max-h-64 selection:bg-[#3e6688]/40">
                {sqlScript}
              </pre>
            )}
          </div>

          {/* Simulated System Date */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-[#222b3d]">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 block">
                Simulated Studio Reference Date
              </label>
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-[#181e2b] hover:bg-[#20283a] text-slate-200 border border-[#222b3d] rounded-xl text-xs cursor-pointer font-medium"
              >
                Apply Date Change
              </button>
            </div>
          </form>

          {/* Backup & Restore */}
          <div className="space-y-3 pt-3 border-t border-[#222b3d]">
            <span className="text-xs font-semibold text-slate-300 block">
              Workspace State Backup & Restore
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 bg-[#181e2b] hover:bg-[#20283a] text-slate-200 border border-[#222b3d] rounded-xl text-xs cursor-pointer font-medium"
              >
                <Download className="w-3.5 h-3.5 text-[#3e6688]" />
                Export State JSON
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#181e2b] hover:bg-[#20283a] text-slate-200 border border-[#222b3d] rounded-xl text-xs cursor-pointer font-medium"
              >
                <Upload className="w-3.5 h-3.5 text-[#c79016]" />
                Restore State JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

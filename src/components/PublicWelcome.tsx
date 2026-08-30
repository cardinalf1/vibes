import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mic, User, Send, Radio, Sparkles, Users, Target, CheckCircle2 } from 'lucide-react';
import { Node, ExpenditureItem, Department } from '../types';
import { GanttChart } from './GanttChart';

interface PublicWelcomeProps {
  nodes: Node[];
  departments: Department[];
  expenditures: ExpenditureItem[];
  simulatedDate: string;
  onRequestAccount: (username: string, notes: string) => Promise<void>;
  onOpenLogin: () => void;
}

export function PublicWelcome({
  nodes,
  departments,
  expenditures,
  simulatedDate,
  onRequestAccount,
  onOpenLogin
}: PublicWelcomeProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [departmentInput, setDepartmentInput] = useState(departments[0]?.name || 'Research');
  const [notesInput, setNotesInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const completedTasks = nodes.filter(n => n.status === 'Completed').length;
  const progressPercent = nodes.length > 0 ? Math.round((completedTasks / nodes.length) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = usernameInput.toLowerCase().trim();
    if (!cleanUsername) return;

    setSubmitting(true);
    setSuccessMsg('');

    try {
      const combinedNotes = `Name: ${nameInput.trim()} | Dept: ${departmentInput} | Message: ${notesInput.trim()}`;
      await onRequestAccount(cleanUsername, combinedNotes);
      setSuccessMsg(`✔ Registration logged for @${cleanUsername}! Your Teacher or Admin will greenlight your account.`);
      setUsernameInput('');
      setNameInput('');
      setNotesInput('');
      setTimeout(() => setSuccessMsg(''), 7000);
    } catch (err) {
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8 font-sans px-4">
      {/* 1. Hero Banner */}
      <div className="bg-gradient-to-br from-[#121620] via-[#161b26] to-[#121620] border border-[#222b3d] rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#883e66]/20 border border-[#883e66]/40 text-[#f472b6] text-xs font-mono font-semibold mb-4">
          <Radio className="w-4 h-4" />
          <span>ISHA VIBES // STUDENT PODCAST INITIATIVE</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-sans">
          CARDINAL :: OVERTURE
        </h1>
        <p className="text-base text-slate-300 max-w-2xl mx-auto mt-2 leading-relaxed">
          The collaborative production cockpit for Isha Vibes — orchestrating student hosts, audio editors, research writers, and faculty supervisors.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <button
            onClick={onOpenLogin}
            className="px-6 py-2.5 rounded-xl bg-[#c79016] hover:bg-[#d89e1a] text-black font-semibold text-xs shadow-lg transition-all cursor-pointer font-sans"
          >
            ENTER STUDIO COCKPIT (LOGIN)
          </button>
          <a
            href="#register"
            className="px-6 py-2.5 rounded-xl bg-[#181e2b] hover:bg-[#222b3d] text-slate-200 border border-[#222b3d] text-xs font-medium transition-all"
          >
            REQUEST TO JOIN THE TEAM
          </a>
        </div>
      </div>

      {/* 2. Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121620] border border-[#222b3d] p-5 rounded-2xl text-center shadow-md">
          <span className="text-xs font-mono uppercase text-slate-400 block font-semibold">Production Departments</span>
          <span className="text-2xl font-bold text-[#9dbcd4] block mt-1.5 font-sans">{departments.length} Units</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Teacher, Hosts, Research, Editing & Admin</span>
        </div>

        <div className="bg-[#121620] border border-[#222b3d] p-5 rounded-2xl text-center shadow-md">
          <span className="text-xs font-mono uppercase text-slate-400 block font-semibold">Active Production Roadmap</span>
          <span className="text-2xl font-bold text-[#f5c358] block mt-1.5 font-sans">{nodes.length} Milestones</span>
          <span className="text-[11px] text-slate-500 mt-1 block">{progressPercent}% of deliverables completed</span>
        </div>

        <div className="bg-[#121620] border border-[#222b3d] p-5 rounded-2xl text-center shadow-md">
          <span className="text-xs font-mono uppercase text-slate-400 block font-semibold">Broadcast Status</span>
          <span className="text-2xl font-bold text-[#f472b6] block mt-1.5 font-sans">Season 1 In-Studio</span>
          <span className="text-[11px] text-slate-500 mt-1 block">Audio mastering & live recording active</span>
        </div>
      </div>

      {/* 3. Join The Team Registration Form */}
      <div id="register" className="bg-[#121620] border border-[#222b3d] rounded-3xl p-8 shadow-2xl max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#3e6688]/20 border border-[#3e6688]/40 text-[#9dbcd4] mb-1">
            <Mic className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white font-sans uppercase">
            Join the Isha Vibes Podcast Crew
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Interested in joining as a Host, Scriptwriter, Sound Editor, or Student Contributor? Submit your desired username to request workspace credentials.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs max-w-lg mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Full Name</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Maya Patel"
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3e6688]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Preferred Department</label>
              <select
                value={departmentInput}
                onChange={(e) => setDepartmentInput(e.target.value)}
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3e6688] cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Desired Username (Login Handle)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs text-slate-500 font-mono">@</span>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="maya, aarav, student1"
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3e6688]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Why would you like to join?</label>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Tell us about your interests (e.g. podcasting, audio editing, research, interview ideas)..."
              rows={3}
              className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#3e6688] resize-none"
            />
          </div>

          {successMsg && (
            <div className="bg-emerald-950/30 text-emerald-300 border border-emerald-800/40 p-3 rounded-xl text-xs text-center font-medium">
              {successMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !usernameInput.trim()}
            className="w-full bg-[#3e6688] hover:bg-[#4d7ca6] text-white font-semibold py-3 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'LOGGING REQUEST...' : 'SUBMIT MEMBERSHIP REQUEST'}
          </button>
        </form>
      </div>

      {/* 4. Interactive Gantt Timeline */}
      <div className="bg-[#121620] border border-[#222b3d] rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 border-b border-[#222b3d] pb-3">
          <Target className="w-4 h-4 text-[#c79016]" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
            Season 1 Production Timeline & Department Milestones
          </h3>
        </div>
        <div className="h-[600px] overflow-hidden rounded-2xl border border-[#222b3d]">
          <GanttChart nodes={nodes} departments={departments} simulatedDate={simulatedDate} />
        </div>
      </div>
    </div>
  );
}

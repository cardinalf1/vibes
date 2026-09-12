import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Download, Award, User, MessageSquare, Calendar, 
  Search, Filter, BarChart3, Sparkles, CheckCircle2 
} from 'lucide-react';
import { SelfAssessment, ASSESSMENT_QUESTIONS, Episode } from '../types';
import { supabaseService } from '../lib/supabaseService';

interface AssessmentReportsProps {
  assessments: SelfAssessment[];
  episodes: Episode[];
}

export function AssessmentReports({ assessments, episodes }: AssessmentReportsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedEpisode, setSelectedEpisode] = useState('All');

  const filteredAssessments = assessments.filter(a => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      a.student_name.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q) ||
      (a.reflection_notes && a.reflection_notes.toLowerCase().includes(q));
    const matchesDept = selectedDept === 'All' || a.department === selectedDept;
    const matchesEp = selectedEpisode === 'All' || (a.episode_id || 'EP-01') === selectedEpisode;
    return matchesSearch && matchesDept && matchesEp;
  });

  const handleExportCSV = () => {
    supabaseService.exportStudentAssessmentsCSV(assessments);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-[#222b3d] rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Top Header */}
      <div className="p-5 border-b border-[#222b3d] bg-gradient-to-r from-[#121620] via-[#161b26] to-[#121620] flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#883e66]/20 border border-[#883e66]/40 flex items-center justify-center text-[#f472b6] shadow-sm">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
                STUDENT SELF-ASSESSMENT REPORTS & REFLECTIONS
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181e2b] border border-[#222b3d] text-[#f472b6]">
                {assessments.length} Submissions Logged
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Review student production self-ratings, collaboration scores, and reflection feedback
            </p>
          </div>
        </div>

        {/* 1-Click CSV Download */}
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>EXPORT ASSESSMENTS (.CSV)</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-b border-[#222b3d] bg-[#121620]/60 flex flex-wrap justify-between items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student name, handle, or reflection notes..."
            className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#883e66]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Hosts">Hosts</option>
            <option value="Research">Research</option>
            <option value="Editing">Editing</option>
            <option value="Teacher">Teacher</option>
            <option value="Admin">Admin</option>
          </select>

          <select
            value={selectedEpisode}
            onChange={(e) => setSelectedEpisode(e.target.value)}
            className="bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="All">All Episodes</option>
            {episodes.map(ep => (
              <option key={ep.id} value={ep.id}>{ep.id}: {ep.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredAssessments.length === 0 ? (
          <div className="bg-[#121620] border border-dashed border-[#222b3d] rounded-2xl p-12 text-center text-xs text-slate-500">
            No self-assessment records matching current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAssessments.map(sub => {
              const scoresList = Object.entries(sub.scores || {});
              const avgScore = scoresList.length > 0 
                ? (scoresList.reduce((acc, [, val]) => acc + val, 0) / scoresList.length).toFixed(1)
                : '0.0';

              return (
                <div
                  key={sub.id}
                  className="bg-[#121620] border border-[#222b3d] rounded-2xl p-5 shadow-lg space-y-4 hover:border-[#324058] transition-all"
                >
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#181e2b] border border-[#2d384e] flex items-center justify-center font-bold text-sm text-slate-200 uppercase">
                        {sub.student_name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white font-sans">{sub.student_name}</h3>
                          <span className="text-[10px] font-mono text-slate-400">@{sub.username}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#3e6688]/20 text-[#9dbcd4] border border-[#3e6688]/40">
                            {sub.department}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                          Target Episode: <strong className="text-white">{sub.episode_id || 'General Cycle'}</strong> • Submitted: {new Date(sub.submitted_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-[#0b0e14] border border-[#222b3d] px-3 py-1.5 rounded-xl text-right">
                        <span className="text-[10px] font-mono uppercase text-slate-400 block">Composite Average</span>
                        <span className={`text-sm font-mono font-bold ${
                          Number(avgScore) > 0 ? 'text-[#33a474]' : Number(avgScore) < 0 ? 'text-[#9b82c1]' : 'text-slate-300'
                        }`}>
                          {Number(avgScore) > 0 ? `+${avgScore}` : avgScore} / 3.0
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 8 Questions Likert Scores Grid */}
                  <div className="bg-[#0b0e14] border border-[#222b3d] rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {ASSESSMENT_QUESTIONS.map(q => {
                      const val = sub.scores?.[q.id] ?? 0;
                      const isAgree = val > 0;
                      const isDisagree = val < 0;

                      return (
                        <div key={q.id} className="bg-[#121620] border border-[#222b3d]/60 rounded-lg p-2 flex justify-between items-center">
                          <span className="text-[11px] text-slate-300 truncate max-w-[120px]" title={q.prompt}>
                            {q.category}
                          </span>
                          <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                            isAgree 
                              ? 'bg-[#33a474]/20 text-[#33a474]' 
                              : isDisagree 
                              ? 'bg-[#9b82c1]/20 text-[#9b82c1]' 
                              : 'bg-[#181e2b] text-slate-400'
                          }`}>
                            {val > 0 ? `+${val}` : val}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Open Reflection Notes */}
                  {sub.reflection_notes && (
                    <div className="bg-[#0b0e14]/60 border border-[#222b3d] rounded-xl p-3.5 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                        <MessageSquare className="w-3 h-3 text-[#f472b6]" />
                        <span>Student Open Reflection</span>
                      </span>
                      <p className="text-xs text-slate-200 italic leading-relaxed whitespace-pre-wrap">
                        "{sub.reflection_notes}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

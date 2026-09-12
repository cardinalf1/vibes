import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, MessageSquare, Send, Award, History, Info, BookOpen } from 'lucide-react';
import { ASSESSMENT_QUESTIONS, SelfAssessment as SelfAssessmentType, Episode } from '../types';
import { useAuth } from './AuthGate';

interface SelfAssessmentProps {
  episodes: Episode[];
  pastAssessments: SelfAssessmentType[];
  onSubmitAssessment: (assessment: Omit<SelfAssessmentType, 'id' | 'submitted_at'>) => Promise<void>;
}

// 7-Point Likert Circle Configuration
const LIKERT_OPTIONS = [
  { value: 3, label: 'Strongly Agree', sizeClass: 'w-10 h-10', borderClass: 'border-[#33a474]', bgSelected: 'bg-[#33a474] text-white', hoverBorder: 'hover:border-[#33a474]', side: 'agree' },
  { value: 2, label: 'Agree', sizeClass: 'w-8 h-8', borderClass: 'border-[#33a474]', bgSelected: 'bg-[#33a474] text-white', hoverBorder: 'hover:border-[#33a474]', side: 'agree' },
  { value: 1, label: 'Slightly Agree', sizeClass: 'w-6 h-6', borderClass: 'border-[#33a474]', bgSelected: 'bg-[#33a474] text-white', hoverBorder: 'hover:border-[#33a474]', side: 'agree' },
  { value: 0, label: 'Neutral', sizeClass: 'w-5 h-5', borderClass: 'border-slate-500', bgSelected: 'bg-slate-400 text-black', hoverBorder: 'hover:border-slate-300', side: 'neutral' },
  { value: -1, label: 'Slightly Disagree', sizeClass: 'w-6 h-6', borderClass: 'border-[#9b82c1]', bgSelected: 'bg-[#9b82c1] text-white', hoverBorder: 'hover:border-[#9b82c1]', side: 'disagree' },
  { value: -2, label: 'Disagree', sizeClass: 'w-8 h-8', borderClass: 'border-[#9b82c1]', bgSelected: 'bg-[#9b82c1] text-white', hoverBorder: 'hover:border-[#9b82c1]', side: 'disagree' },
  { value: -3, label: 'Strongly Disagree', sizeClass: 'w-10 h-10', borderClass: 'border-[#9b82c1]', bgSelected: 'bg-[#9b82c1] text-white', hoverBorder: 'hover:border-[#9b82c1]', side: 'disagree' },
];

export function SelfAssessment({ episodes, pastAssessments, onSubmitAssessment }: SelfAssessmentProps) {
  const { user, username, name: displayName, department } = useAuth();
  
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(episodes[0]?.id || 'EP-01');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'form' | 'history'>('form');

  const mySubmissions = pastAssessments.filter(
    a => a.username.toLowerCase() === (username || '').toLowerCase()
  );

  const totalAnswered = Object.keys(scores).length;
  const isComplete = totalAnswered === ASSESSMENT_QUESTIONS.length;

  const handleSelectScore = (questionId: string, value: number) => {
    setScores(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      alert(`Please respond to all ${ASSESSMENT_QUESTIONS.length} evaluation questions.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitAssessment({
        username: username || 'student',
        student_name: displayName || username || 'Student',
        department: department || 'Research',
        episode_id: selectedEpisodeId,
        scores,
        reflection_notes: reflectionNotes.trim()
      });

      setSuccessMessage('Your self-assessment has been securely submitted to the faculty review panel.');
      setScores({});
      setReflectionNotes('');
      setTimeout(() => setSuccessMessage(null), 6000);
    } catch (err: any) {
      alert(`Submission failed: ${err.message || 'Network error'}`);
    } finally {
      setIsSubmitting(false);
    }
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
                STUDENT PRODUCTION SELF-ASSESSMENT
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181e2b] border border-[#222b3d] text-[#f472b6]">
                Confidential Faculty Feedback
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Reflect honestly on your teamwork, studio craft, and creative contributions for this episode cycle
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('form')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'form'
                ? 'bg-[#883e66] text-white shadow-md shadow-[#883e66]/20'
                : 'bg-[#181e2b] text-slate-400 hover:text-white border border-[#222b3d]'
            }`}
          >
            New Assessment
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'history'
                ? 'bg-[#883e66] text-white shadow-md shadow-[#883e66]/20'
                : 'bg-[#181e2b] text-slate-400 hover:text-white border border-[#222b3d]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Submissions ({mySubmissions.length})</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-300 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold block">{successMessage}</span>
              <span className="text-[11px] text-emerald-400/80">
                Your responses have been archived into the teacher review journal.
              </span>
            </div>
          </motion.div>
        )}

        {activeView === 'form' ? (
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
            {/* Target Episode Selector Card */}
            <div className="bg-[#121620] border border-[#222b3d] rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4 shadow-md">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                  EVALUATION CONTEXT
                </span>
                <h3 className="text-sm font-bold text-white font-sans mt-0.5">
                  Selecting Episode & Production Cycle
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300">Episode:</span>
                <select
                  value={selectedEpisodeId}
                  onChange={(e) => setSelectedEpisodeId(e.target.value)}
                  className="bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#883e66] cursor-pointer"
                >
                  {episodes.map(ep => (
                    <option key={ep.id} value={ep.id}>
                      {ep.id} — {ep.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Progress Counter Pill */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-slate-400 font-mono">
                COMPLETED: <strong className="text-white">{totalAnswered}</strong> / {ASSESSMENT_QUESTIONS.length} Questions
              </span>
              <div className="w-48 h-2 bg-[#181e2b] border border-[#222b3d] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#33a474] via-[#3e6688] to-[#9b82c1] transition-all duration-300"
                  style={{ width: `${(totalAnswered / ASSESSMENT_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* 16Personalities-Style Likert Questions */}
            <div className="space-y-6">
              {ASSESSMENT_QUESTIONS.map((q, idx) => {
                const currentVal = scores[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-[#121620] border border-[#222b3d] rounded-2xl p-6 shadow-md hover:border-[#324058] transition-all"
                  >
                    <div className="text-center mb-6">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
                        PILLAR 0{idx + 1} • {q.category}
                      </span>
                      <h4 className="text-sm sm:text-base font-medium text-slate-100 max-w-xl mx-auto leading-relaxed">
                        {q.prompt}
                      </h4>
                    </div>

                    {/* 7-Point Circular Likert Scale (Matches 16personalities format) */}
                    <div className="flex items-center justify-between max-w-lg mx-auto py-2 px-2">
                      <span className="text-xs font-semibold text-[#33a474] tracking-wide select-none">
                        Agree
                      </span>

                      <div className="flex items-center justify-center gap-3 sm:gap-4">
                        {LIKERT_OPTIONS.map((opt) => {
                          const isSelected = currentVal === opt.value;

                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSelectScore(q.id, opt.value)}
                              title={`${opt.label} (${opt.value > 0 ? `+${opt.value}` : opt.value})`}
                              className={`rounded-full border-2 transition-all flex items-center justify-center cursor-pointer ${opt.sizeClass} ${opt.borderClass} ${opt.hoverBorder} ${
                                isSelected 
                                  ? `${opt.bgSelected} ring-4 ring-white/10 scale-110 shadow-lg` 
                                  : 'bg-transparent opacity-75 hover:opacity-100 hover:scale-105'
                              }`}
                            >
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-white shadow-sm" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <span className="text-xs font-semibold text-[#9b82c1] tracking-wide select-none">
                        Disagree
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Open Reflection Textarea */}
            <div className="bg-[#121620] border border-[#222b3d] rounded-2xl p-6 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#f472b6]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Open Reflections, Challenges & Key Learnings
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Share what went particularly well during this production cycle, any friction points encountered with equipment or scheduling, and ideas for the next episode.
              </p>
              <textarea
                required
                rows={4}
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                placeholder="During this episode, I felt our scripting was thorough, but we faced audio latency during recording..."
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl p-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#883e66] transition-colors leading-relaxed"
              />
            </div>

            {/* Submission Action */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !isComplete}
                className="bg-gradient-to-r from-[#883e66] to-[#b45f06] hover:from-[#a14b7a] hover:to-[#c76d08] text-white font-semibold text-xs px-8 py-3 rounded-xl transition-all shadow-xl shadow-[#883e66]/20 flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Transmitting Assessment...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SUBMIT ASSESSMENT TO TEACHER PANEL</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Past Assessment Submissions View */
          <div className="max-w-3xl mx-auto space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              YOUR PREVIOUS SELF-ASSESSMENTS ({mySubmissions.length})
            </h3>

            {mySubmissions.length === 0 ? (
              <div className="p-8 bg-[#121620] border border-dashed border-[#222b3d] rounded-2xl text-center text-xs text-slate-500">
                You have not submitted any self-assessments yet. Complete the form above to record your first production review.
              </div>
            ) : (
              mySubmissions.map(sub => (
                <div key={sub.id} className="bg-[#121620] border border-[#222b3d] rounded-2xl p-5 space-y-3 shadow-md">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-sans">{sub.student_name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181e2b] border border-[#222b3d] text-slate-300">
                          {sub.department}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        Target: {sub.episode_id || 'General Cycle'} • {new Date(sub.submitted_at).toLocaleDateString()}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-semibold">
                      ARCHIVED IN JOURNAL
                    </span>
                  </div>

                  {sub.reflection_notes && (
                    <div className="bg-[#0b0e14] border border-[#222b3d] rounded-xl p-3 text-xs text-slate-300 italic leading-relaxed">
                      "{sub.reflection_notes}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

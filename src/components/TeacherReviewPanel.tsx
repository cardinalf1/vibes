import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, AlertCircle, RotateCcw, MessageSquare, 
  Calendar, Check, X, ShieldCheck, Clock, User, Radio, ArrowRight
} from 'lucide-react';
import { Node, Episode, Department, Status } from '../types';

interface TeacherReviewPanelProps {
  nodes: Node[];
  episodes: Episode[];
  departments: Department[];
  onApproveTask: (taskId: string) => Promise<void>;
  onRevertTask: (taskId: string, feedbackNotes: string) => Promise<void>;
}

export function TeacherReviewPanel({
  nodes,
  episodes,
  departments,
  onApproveTask,
  onRevertTask
}: TeacherReviewPanelProps) {
  const [selectedEpisodeFilter, setSelectedEpisodeFilter] = useState<string>('All');
  const [revertingTaskId, setRevertingTaskId] = useState<string | null>(null);
  const [revertNotes, setRevertNotes] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter tasks that need review or were recently submitted
  const pendingTasks = nodes.filter(n => {
    const matchesEp = selectedEpisodeFilter === 'All' || (n.episode_id || 'EP-01') === selectedEpisodeFilter;
    return matchesEp && n.review_status === 'Pending Review';
  });

  const recentResolvedTasks = nodes.filter(n => {
    const matchesEp = selectedEpisodeFilter === 'All' || (n.episode_id || 'EP-01') === selectedEpisodeFilter;
    return matchesEp && (n.review_status === 'Approved' || n.review_status === 'Reverted');
  });

  const handleApprove = async (taskId: string) => {
    setProcessingId(taskId);
    try {
      await onApproveTask(taskId);
    } catch (e) {
      alert('Failed to approve task');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmRevert = async (taskId: string) => {
    if (!revertNotes.trim()) {
      alert('Please provide corrective guidance reasoning for the student team.');
      return;
    }
    setProcessingId(taskId);
    try {
      await onRevertTask(taskId, revertNotes.trim());
      setRevertingTaskId(null);
      setRevertNotes('');
    } catch (e) {
      alert('Failed to revert task');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-[#222b3d] rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Top Header */}
      <div className="p-5 border-b border-[#222b3d] bg-gradient-to-r from-[#121620] via-[#161b26] to-[#121620] flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c79016]/20 border border-[#c79016]/40 flex items-center justify-center text-[#f5c358] shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
                QUALITY ASSURANCE & TASK REVIEW QUEUE
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181e2b] border border-[#222b3d] text-[#f5c358]">
                {pendingTasks.length} PENDING VERIFICATION
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Review student deliverable submissions, verify quality standards, and commit milestones to the official Gantt
            </p>
          </div>
        </div>

        {/* Filter by Episode */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filter Episode:</span>
          <select
            value={selectedEpisodeFilter}
            onChange={(e) => setSelectedEpisodeFilter(e.target.value)}
            className="bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer"
          >
            <option value="All">All Episodes</option>
            {episodes.map(ep => (
              <option key={ep.id} value={ep.id}>{ep.id}: {ep.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Pending Reviews Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f5c358]" />
              <span>Awaiting Teacher Quality Review ({pendingTasks.length})</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Approving commits the task to Gantt as Completed
            </span>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="bg-[#121620] border border-dashed border-[#222b3d] rounded-2xl p-8 text-center text-xs text-slate-500">
              No tasks currently pending review in this filter. When students mark a task "Submitted for Review", it will appear here immediately.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingTasks.map(task => {
                const ep = episodes.find(e => e.id === (task.episode_id || 'EP-01'));
                const isReverting = revertingTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className="bg-[#121620] border border-[#c79016]/40 rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c79016] via-[#f5c358] to-[#b45f06]" />

                    <div className="flex flex-wrap justify-between items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#c79016]/20 text-[#f5c358] border border-[#c79016]/40 font-semibold">
                            PENDING QA REVIEW
                          </span>
                          <span className="text-xs font-mono text-slate-400">{task.id}</span>
                          <span className="text-xs font-mono text-slate-400">
                            • {ep ? `${ep.id}: ${ep.title}` : (task.episode_id || 'EP-01')}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mt-1.5 font-sans">
                          {task.title}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-3 py-1 rounded-xl bg-[#0b0e14] border border-[#222b3d] text-slate-200">
                          {task.department}
                        </span>
                        <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-[#0b0e14] border border-[#222b3d] text-slate-300">
                          {task.planned_start} ➔ {task.planned_end}
                        </span>
                      </div>
                    </div>

                    {/* Student Submission Proof / Notes */}
                    <div className="bg-[#0b0e14] border border-[#222b3d] rounded-xl p-3 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <User className="w-3.5 h-3.5 text-[#3e6688]" />
                        <span>Submitted by: <strong className="text-white">@{task.submitted_by || task.assigned_to || 'student'}</strong></span>
                      </div>
                      <p className="text-xs text-slate-200 italic mt-0.5">
                        "{task.submission_notes || 'Deliverables finalized for QA verification.'}"
                      </p>
                    </div>

                    {/* Action Bar or Revert Prompt */}
                    {isReverting ? (
                      <div className="bg-[#181e2b] border border-[#883712]/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#fca5a5]">
                          <AlertCircle className="w-4 h-4" />
                          <span>Enter Reversion Feedback & Corrective Guidance (Confidential to {task.department}):</span>
                        </div>
                        <textarea
                          rows={2}
                          value={revertNotes}
                          onChange={(e) => setRevertNotes(e.target.value)}
                          placeholder="e.g. Please re-export audio master with noise gate applied on track 2..."
                          className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#883712]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setRevertingTaskId(null); setRevertNotes(''); }}
                            className="px-3 py-1.5 rounded-xl text-xs text-slate-400 bg-[#121620] border border-[#222b3d] hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleConfirmRevert(task.id)}
                            disabled={processingId === task.id}
                            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#883712] hover:bg-[#a34417] shadow-md cursor-pointer disabled:opacity-50"
                          >
                            Confirm Reversion & Send Guidance
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end items-center gap-3 pt-2 border-t border-[#222b3d]/60">
                        <button
                          onClick={() => { setRevertingTaskId(task.id); setRevertNotes(''); }}
                          disabled={processingId === task.id}
                          className="flex items-center gap-1.5 text-xs text-[#fca5a5] hover:text-white bg-[#883712]/20 hover:bg-[#883712]/40 border border-[#883712]/40 px-4 py-2 rounded-xl font-medium transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Request Changes / Revert</span>
                        </button>

                        <button
                          onClick={() => handleApprove(task.id)}
                          disabled={processingId === task.id}
                          className="flex items-center gap-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl font-semibold transition-all shadow-md cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Commit to Gantt</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recently Resolved History */}
        {recentResolvedTasks.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-[#222b3d]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Resolved Deliverables & Review History ({recentResolvedTasks.length})
            </h3>

            <div className="divide-y divide-[#222b3d]/60 bg-[#121620] border border-[#222b3d] rounded-2xl overflow-hidden">
              {recentResolvedTasks.map(task => (
                <div key={task.id} className="p-4 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{task.title}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        task.review_status === 'Approved'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          : 'bg-[#883712]/20 text-[#fca5a5] border-[#883712]/40'
                      }`}>
                        {task.review_status === 'Approved' ? 'VERIFIED & COMMITTED' : 'CHANGES REQUESTED'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                      {task.department} • {task.episode_id || 'EP-01'} • Assigned: @{task.assigned_to || 'unassigned'}
                    </span>
                  </div>

                  {task.review_notes && (
                    <div className="text-xs text-slate-300 max-w-md bg-[#0b0e14] px-3 py-1.5 rounded-xl border border-[#222b3d]">
                      Feedback: "{task.review_notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

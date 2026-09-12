import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Radio, Calendar, Users, User, CheckCircle2, Clock, 
  AlertCircle, RotateCcw, Plus, UserPlus, Trash2, Edit2, Play, 
  ExternalLink, Mic, Search, Music, Shield, Sparkles, Send, GripVertical, Check 
} from 'lucide-react';
import { Episode, Node, Department, AuthorizedUser, Status, Priority } from '../types';
import { GanttChart } from './GanttChart';
import { useAuth } from './AuthGate';

interface EpisodeDetailViewProps {
  episode: Episode;
  nodes: Node[];
  departments: Department[];
  users: AuthorizedUser[];
  onBack: () => void;
  onUpdateEpisode: (episode: Episode) => void;
  onCreateTask: (task: { 
    title: string; 
    description: string; 
    department: string; 
    priority: Priority;
    planned_start: string; 
    planned_end: string; 
    dependency?: string;
    assigned_to?: string | null;
    episode_id?: string;
  }) => void;
  onUpdateTaskStatus: (id: string, status: Status) => void;
  onSubmitTaskForReview: (id: string, proofNotes: string) => Promise<void>;
  onAssignStudentToTask: (taskId: string, username: string | null) => void;
  onDeleteTask: (id: string) => void;
}

export function EpisodeDetailView({
  episode,
  nodes,
  departments,
  users,
  onBack,
  onUpdateEpisode,
  onCreateTask,
  onUpdateTaskStatus,
  onSubmitTaskForReview,
  onAssignStudentToTask,
  onDeleteTask
}: EpisodeDetailViewProps) {
  const { user, username: currentUsername, role: authRole, department: userDepartment } = useAuth();
  const isTeacherOrAdmin = authRole === 'Admin' || authRole === 'Teacher';

  // Submitting for review modal / prompt state
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New task form state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskDept, setNewTaskDept] = useState<string>(departments[0]?.name || 'Research');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('Medium');
  const [newTaskStart, setNewTaskStart] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskEnd, setNewTaskEnd] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // Filter production departments (exclude Admin role)
  const productionDepts = departments.filter(d => d.name.toLowerCase() !== 'admin');

  // Add crew modal state
  const [isAddingCrew, setIsAddingCrew] = useState(false);
  const [selectedCrewDept, setSelectedCrewDept] = useState<string>(productionDepts[0]?.name || 'Hosts');
  const [selectedCrewUsername, setSelectedCrewUsername] = useState<string>('');

  // Active view tab inside episode
  const [activeTab, setActiveTab] = useState<'tasks' | 'gantt' | 'audio'>('tasks');

  // Drag-and-drop state
  const [draggedUsername, setDraggedUsername] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);

  // Filter tasks belonging strictly to this episode
  const episodeTasks = nodes.filter(n => (n.episode_id || 'EP-01') === episode.id);

  const completedTasks = episodeTasks.filter(n => n.status === 'Completed').length;
  const totalTasks = episodeTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate dynamic pacing
  let pacingBadge = { label: 'On Track', color: 'bg-[#3e6688]/20 text-[#9dbcd4] border-[#3e6688]/40' };
  if (progressPercent >= 75) {
    pacingBadge = { label: 'Optimal Velocity', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' };
  } else if (episodeTasks.some(n => n.review_status === 'Reverted')) {
    pacingBadge = { label: 'Pacing Lag (Changes Requested)', color: 'bg-[#883712]/20 text-[#fca5a5] border-[#883712]/40' };
  } else if (episode.status === 'Published') {
    pacingBadge = { label: 'Completed & Broadcast', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' };
  }

  // Current Episode Assigned Crew Map (Multiple students per department)
  const crewMap: Record<string, string[]> = episode.assigned_crew || {};

  // All students assigned to this episode across all departments
  const episodeCrewUsernames = Array.from(new Set(Object.values(crewMap).flat().filter(Boolean)));
  const episodeCrewMembers = users.filter(u => episodeCrewUsernames.includes(u.username));

  // Calculate Available Staff Bay (Only students assigned to this episode who don't have an active task in this episode)
  const assignedUsernames = new Set(episodeTasks.map(t => t.assigned_to).filter(Boolean));
  const availableStudents = episodeCrewMembers.filter(u => !assignedUsernames.has(u.username));

  const handleAddCrewMember = (deptToAssign?: string, unameToAssign?: string) => {
    const targetDept = deptToAssign || selectedCrewDept;
    const targetUname = unameToAssign || selectedCrewUsername;
    if (!targetUname) {
      alert('Please choose a student to assign to this role.');
      return;
    }
    const currentList = crewMap[targetDept] || [];
    if (!currentList.includes(targetUname)) {
      const updatedCrew = {
        ...crewMap,
        [targetDept]: [...currentList, targetUname]
      };
      onUpdateEpisode({
        ...episode,
        assigned_crew: updatedCrew
      });
    }
    setSelectedCrewUsername('');
    setIsAddingCrew(false);
  };

  const handleRemoveCrewMember = (dept: string, uname: string) => {
    const currentList = crewMap[dept] || [];
    const updatedCrew = {
      ...crewMap,
      [dept]: currentList.filter(u => u !== uname)
    };
    onUpdateEpisode({
      ...episode,
      assigned_crew: updatedCrew
    });
  };

  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onCreateTask({
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      department: newTaskDept,
      priority: newTaskPriority,
      planned_start: newTaskStart,
      planned_end: newTaskEnd,
      assigned_to: newTaskAssignee || null,
      episode_id: episode.id
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsAddingTask(false);
  };

  const handleConfirmSubmitReview = async (taskId: string) => {
    setIsSubmitting(true);
    try {
      await onSubmitTaskForReview(taskId, submissionNotes.trim());
      setSubmittingTaskId(null);
      setSubmissionNotes('');
    } catch (e) {
      alert('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-[#222b3d] rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Top Banner Header */}
      <div className="p-5 border-b border-[#222b3d] bg-gradient-to-r from-[#121620] via-[#161b26] to-[#121620] flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-[#181e2b] hover:bg-[#222b3d] text-slate-300 hover:text-white border border-[#222b3d] flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Back to All Episodes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#883e66]/20 border border-[#883e66]/40 text-[#f472b6] font-bold">
                {episode.id}
              </span>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${pacingBadge.color}`}>
                ● {pacingBadge.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Target Release: <strong className="text-slate-200">{episode.target_release_date}</strong>
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white font-sans mt-1">
              {episode.title}
            </h1>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#0b0e14] p-1 rounded-xl border border-[#222b3d]">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tasks' ? 'bg-[#3e6688] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Task Board ({episodeTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('gantt')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'gantt' ? 'bg-[#3e6688] text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gantt Timeline
            </button>
          </div>

          {isTeacherOrAdmin && (
            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#c79016] hover:bg-[#d89e1a] text-black px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>NEW DELIVERABLE</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Pacing & Progress Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#121620] border border-[#222b3d] p-4 rounded-2xl md:col-span-2 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-slate-400 uppercase font-semibold">Production Velocity</span>
              <span className="font-mono text-white font-bold">{completedTasks} / {totalTasks} Completed ({progressPercent}%)</span>
            </div>
            <div className="w-full h-3 bg-[#0b0e14] border border-[#222b3d] rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-[#3e6688] via-[#c79016] to-[#33a474] rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {episode.notes || 'Production milestones for recording, scripting, and audio mixdown.'}
            </p>
          </div>

          <div className="bg-[#121620] border border-[#222b3d] p-4 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Episode Lifecycle</span>
            <span className="text-base font-bold text-white block mt-1">{episode.status}</span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Guest: {episode.guest_name || 'Panel Discussion'}
            </span>
          </div>

          <div className="bg-[#121620] border border-[#222b3d] p-4 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Length</span>
            <span className="text-base font-bold text-white block mt-1">
              {episode.runtime_minutes ? `${episode.runtime_minutes} Mins` : '45 Mins'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {episode.audio_url ? 'Master audio uploaded' : 'Target studio duration'}
            </span>
          </div>
        </div>

        {/* Cast & Crew by Department Roster */}
        <div className="bg-[#121620] border border-[#222b3d] rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#3e6688]" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Assigned Cast & Production Crew
                </h3>
                <span className="text-[11px] text-slate-400">
                  {isTeacherOrAdmin ? 'Click on any role card to assign students to that department' : 'Current department allocations'}
                </span>
              </div>
            </div>

            {isTeacherOrAdmin && (
              <button
                onClick={() => {
                  setSelectedCrewDept(productionDepts[0]?.name || 'Hosts');
                  setSelectedCrewUsername('');
                  setIsAddingCrew(true);
                }}
                className="text-[11px] font-semibold text-[#f5c358] hover:text-white flex items-center gap-1 bg-[#181e2b] hover:bg-[#222b3d] border border-[#222b3d] px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Assign Staff Member</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {productionDepts.map(dept => {
              const members = crewMap[dept.name] || [];

              return (
                <div 
                  key={dept.id} 
                  onClick={() => {
                    if (isTeacherOrAdmin) {
                      setSelectedCrewDept(dept.name);
                      setSelectedCrewUsername('');
                      setIsAddingCrew(true);
                    }
                  }}
                  className={`bg-[#0b0e14] border rounded-xl p-3 space-y-2 transition-all group ${
                    isTeacherOrAdmin 
                      ? 'border-[#222b3d] hover:border-[#3e6688] hover:bg-[#121620] cursor-pointer shadow-sm hover:shadow-md' 
                      : 'border-[#222b3d]'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300 group-hover:text-white font-sans flex items-center gap-1.5">
                      {dept.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-slate-400 bg-[#181e2b] px-1.5 py-0.5 rounded border border-[#222b3d]">
                        {members.length}
                      </span>
                      {isTeacherOrAdmin && (
                        <span className="text-[10px] text-[#f5c358] group-hover:underline font-mono">
                          + Assign
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {members.length === 0 ? (
                      <span className="text-[11px] text-slate-600 italic">No members assigned</span>
                    ) : (
                      members.map(uname => (
                        <span
                          key={uname}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#181e2b] border border-[#222b3d] text-slate-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>@{uname}</span>
                          {isTeacherOrAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveCrewMember(dept.name, uname);
                              }}
                              className="text-slate-500 hover:text-red-400 p-0.5"
                              title="Remove from role"
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Teacher Drag-and-Drop Staff Bay */}
        {isTeacherOrAdmin && (
          <div className="bg-[#121620]/90 border border-[#3e6688]/40 rounded-2xl p-4 space-y-2 shadow-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-[#3e6688]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Available Student Staff Bay (Drag onto any task card below)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {availableStudents.length} Students On Bench
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {episodeCrewMembers.length === 0 ? (
                <span className="text-xs text-slate-500 italic py-1">
                  No crew members assigned to this episode yet. Click on any department role above to assign students first.
                </span>
              ) : availableStudents.length === 0 ? (
                <span className="text-xs text-slate-500 italic py-1">
                  All assigned episode crew members ({episodeCrewMembers.length}) currently have active tasks for this episode.
                </span>
              ) : (
                availableStudents.map(student => (
                  <div
                    key={student.username}
                    draggable
                    onDragStart={() => setDraggedUsername(student.username)}
                    onDragEnd={() => setDraggedUsername(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#181e2b] hover:bg-[#20283a] border border-[#2d384e] rounded-xl text-xs text-slate-200 cursor-grab active:cursor-grabbing shadow-sm hover:border-[#3e6688] transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-semibold">{student.name || `@${student.username}`}</span>
                    <span className="text-[10px] font-mono text-slate-400">({student.department || 'General'})</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main Content Tabs: Task Board vs Gantt Timeline */}
        {activeTab === 'tasks' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                PRODUCTION DELIVERABLES ({episodeTasks.length})
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Students can submit tasks in their department for teacher review
              </span>
            </div>

            {episodeTasks.length === 0 ? (
              <div className="bg-[#121620] border border-dashed border-[#222b3d] rounded-2xl p-12 text-center text-xs text-slate-500">
                No deliverables created for this episode yet. Click "+ NEW DELIVERABLE" to add milestones.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {episodeTasks.map(task => {
                  const isAssignedToMe = task.assigned_to?.toLowerCase() === (currentUsername || '').toLowerCase();
                  const isMyDept = userDepartment?.toLowerCase() === task.department.toLowerCase();
                  const canSubmitReview = isTeacherOrAdmin || isAssignedToMe || isMyDept;
                  const isDragTarget = dragOverTaskId === task.id;

                  // Confidential Feedback Gate:
                  // Only members of this task's department OR teachers/admins can see teacher revert notes
                  const canViewFeedback = isTeacherOrAdmin || isMyDept || isAssignedToMe;

                  return (
                    <div
                      key={task.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (isTeacherOrAdmin && draggedUsername) setDragOverTaskId(task.id);
                      }}
                      onDragLeave={() => setDragOverTaskId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedUsername) {
                          onAssignStudentToTask(task.id, draggedUsername);
                          setDraggedUsername(null);
                          setDragOverTaskId(null);
                        }
                      }}
                      className={`bg-[#121620] border rounded-2xl p-5 shadow-lg space-y-4 transition-all ${
                        isDragTarget 
                          ? 'border-[#3e6688] ring-2 ring-[#3e6688]/40 bg-[#181e2b]' 
                          : 'border-[#222b3d] hover:border-[#324058]'
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0b0e14] border border-[#222b3d] text-slate-400">
                              {task.id}
                            </span>
                            <span className="text-xs font-mono font-semibold text-slate-300 bg-[#0b0e14] border border-[#222b3d] px-2.5 py-0.5 rounded-lg">
                              {task.department}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                              task.review_status === 'Approved'
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                : task.review_status === 'Pending Review'
                                ? 'bg-[#c79016]/20 text-[#f5c358] border-[#c79016]/40'
                                : task.review_status === 'Reverted'
                                ? 'bg-[#883712]/20 text-[#fca5a5] border-[#883712]/40'
                                : 'bg-[#181e2b] text-slate-400 border-[#222b3d]'
                            }`}>
                              {task.review_status === 'Approved' ? '✓ QA Verified' : task.review_status === 'Pending Review' ? '⏳ Review Pending' : task.review_status === 'Reverted' ? '⚠ Changes Requested' : 'Working'}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-white mt-1.5 font-sans">
                            {task.title}
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                            {task.description}
                          </p>
                        </div>

                        {/* Assignee & Dates */}
                        <div className="flex flex-col sm:items-end gap-1.5 text-xs">
                          <div className="flex items-center gap-1.5 font-mono text-slate-300">
                            <User className="w-3.5 h-3.5 text-[#3e6688]" />
                            {isTeacherOrAdmin ? (
                              <select
                                value={task.assigned_to || ''}
                                onChange={(e) => onAssignStudentToTask(task.id, e.target.value || null)}
                                className="bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2 py-0.5 text-xs text-slate-200 outline-none cursor-pointer hover:border-[#3e6688]"
                                title="Assign to episode crew member"
                              >
                                <option value="">-- Unassigned --</option>
                                {episodeCrewMembers.map(u => (
                                  <option key={u.username} value={u.username}>
                                    @{u.username} ({u.department})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span>Assignee: <strong className="text-white">@{task.assigned_to || 'unassigned'}</strong></span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {task.planned_start} ➔ {task.planned_end}
                          </span>
                        </div>
                      </div>

                      {/* Department-Confidential Teacher Feedback Alert Box */}
                      {task.review_status === 'Reverted' && task.review_notes && canViewFeedback && (
                        <div className="bg-[#883712]/15 border border-[#883712]/40 rounded-xl p-3.5 flex items-start gap-3">
                          <AlertCircle className="w-4 h-4 text-[#fca5a5] shrink-0 mt-0.5" />
                          <div className="space-y-1 text-xs">
                            <span className="font-bold text-[#fca5a5] block font-mono">
                              TEACHER QA REVISION GUIDANCE (Confidential to {task.department}):
                            </span>
                            <p className="text-slate-200 italic leading-relaxed">
                              "{task.review_notes}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Bar for Student / Teacher */}
                      <div className="flex justify-between items-center pt-2 border-t border-[#222b3d]/60 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">Status:</span>
                          <select
                            disabled={!canSubmitReview && !isTeacherOrAdmin}
                            value={task.status}
                            onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as Status)}
                            className="bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer disabled:opacity-50"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Student Submit for Review Button (Department Gated) */}
                          {task.review_status !== 'Approved' && (
                            <button
                              disabled={!canSubmitReview}
                              onClick={() => {
                                if (!canSubmitReview) {
                                  alert(`Only students in the ${task.department} department can submit this task for review.`);
                                  return;
                                }
                                setSubmittingTaskId(task.id);
                              }}
                              className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-xl transition-all shadow-sm ${
                                canSubmitReview
                                  ? 'bg-[#883e66] hover:bg-[#a14b7a] text-white cursor-pointer'
                                  : 'bg-[#181e2b] text-slate-500 border border-[#222b3d] cursor-not-allowed opacity-50'
                              }`}
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{task.review_status === 'Pending Review' ? 'Update Review Submission' : 'Submit for QA Review'}</span>
                            </button>
                          )}

                          {isTeacherOrAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete task "${task.title}"?`)) onDeleteTask(task.id);
                              }}
                              className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                              title="Delete Task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Embedded Episode Gantt Chart */
          <div className="h-[550px]">
            <GanttChart 
              nodes={episodeTasks} 
              departments={departments}
              simulatedDate={new Date().toISOString().split('T')[0]} 
            />
          </div>
        )}
      </div>

      {/* Submit for Review Modal */}
      <AnimatePresence>
        {submittingTaskId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121620] border border-[#222b3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-white font-sans uppercase">
                  Submit Deliverable for QA Review
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Attach your proof notes, Drive link, or script summary for faculty verification
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Deliverable Notes / Proof</label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="e.g. Master mix v2 uploaded to Drive. Audio levels balanced at -14 LUFS."
                  className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#883e66]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#222b3d]">
                <button
                  type="button"
                  onClick={() => setSubmittingTaskId(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-[#181e2b] border border-[#222b3d]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleConfirmSubmitReview(submittingTaskId)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#883e66] hover:bg-[#a14b7a] shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Transmitting...' : 'Submit to Teacher Queue'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121620] border border-[#222b3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-white font-sans uppercase">
                  Add Deliverable to {episode.id}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Deploy new milestone task to this episode roadmap</p>
              </div>

              <form onSubmit={handleCreateNewTask} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Host Recording Track 2"
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
                  <input
                    type="text"
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    placeholder="Key deliverables..."
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Department</label>
                    <select
                      value={newTaskDept}
                      onChange={(e) => setNewTaskDept(e.target.value)}
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                    >
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Assignee (Episode Crew Only)</label>
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                    >
                      <option value="">-- Unassigned --</option>
                      {episodeCrewMembers.length === 0 ? (
                        <option value="" disabled>No crew assigned to this episode yet</option>
                      ) : (
                        episodeCrewMembers.map(u => (
                          <option key={u.username} value={u.username}>
                            {u.name || `@${u.username}`} ({u.department})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newTaskStart}
                      onChange={(e) => setNewTaskStart(e.target.value)}
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={newTaskEnd}
                      onChange={(e) => setNewTaskEnd(e.target.value)}
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#222b3d]">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 bg-[#181e2b] border border-[#222b3d]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-black bg-[#c79016] hover:bg-[#d89e1a] shadow-md cursor-pointer"
                  >
                    Deploy Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Crew Member Modal */}
      <AnimatePresence>
        {isAddingCrew && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121620] border border-[#222b3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-white font-sans uppercase">
                  Assign Staff to {episode.id}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a role and student to assign to this episode
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Production Role / Department</label>
                  <select
                    value={selectedCrewDept}
                    onChange={(e) => setSelectedCrewDept(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                  >
                    {productionDepts.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quick-Pick Recommended Students for this specific role */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Quick Assign (Students in {selectedCrewDept})
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-[#0b0e14] border border-[#222b3d] rounded-xl">
                    {(() => {
                      const deptStudents = users.filter(
                        u => u.role === 'Member' && u.department?.trim().toLowerCase() === selectedCrewDept.trim().toLowerCase()
                      );

                      if (deptStudents.length === 0) {
                        return (
                          <span className="text-xs text-slate-500 italic p-2 block w-full text-center">
                            No registered students in "{selectedCrewDept}" department. Select from full roster below.
                          </span>
                        );
                      }

                      return deptStudents.map(u => {
                        const isAlreadyInRole = (crewMap[selectedCrewDept] || []).includes(u.username);

                        return (
                          <button
                            key={u.username}
                            type="button"
                            disabled={isAlreadyInRole}
                            onClick={() => handleAddCrewMember(selectedCrewDept, u.username)}
                            className={`text-[11px] font-mono px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                              isAlreadyInRole
                                ? 'bg-[#181e2b] text-slate-600 border-[#222b3d] cursor-not-allowed opacity-50'
                                : 'bg-[#3e6688]/20 hover:bg-[#3e6688] text-white border-[#3e6688]/60 shadow-sm'
                            }`}
                          >
                            <span className="font-semibold">{u.name || `@${u.username}`}</span>
                            {isAlreadyInRole ? (
                              <span className="text-[9px] text-slate-500 font-sans">(Added)</span>
                            ) : (
                              <span className="text-[9px] text-[#f5c358] font-sans">+ Assign</span>
                            )}
                          </button>
                        );
                      });
                    })()}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Or Choose from Full Roster</label>
                  <select
                    value={selectedCrewUsername}
                    onChange={(e) => setSelectedCrewUsername(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                  >
                    <option value="">-- Choose Member --</option>
                    {users.map(u => (
                      <option key={u.username} value={u.username}>
                        {u.name || `@${u.username}`} ({u.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#222b3d]">
                <button
                  type="button"
                  onClick={() => setIsAddingCrew(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-[#181e2b] border border-[#222b3d]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAddCrewMember(selectedCrewDept, selectedCrewUsername)}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#3e6688] hover:bg-[#4d7ca6] shadow-md cursor-pointer"
                >
                  Assign to Role
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

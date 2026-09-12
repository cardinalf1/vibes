import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, Plus, Trash2, Edit2, Play, Users, Calendar, 
  ExternalLink, Mic, CheckCircle2, Clock, Sparkles, ChevronRight, Search 
} from 'lucide-react';
import { Episode, EpisodeStatus, Department, AuthorizedUser, Node } from '../types';

interface EpisodeHubProps {
  episodes: Episode[];
  nodes: Node[];
  departments: Department[];
  users: AuthorizedUser[];
  onSelectEpisode: (episode: Episode) => void;
  onAddEpisode: (episode: Omit<Episode, 'id' | 'created_at'>) => void;
  onEditEpisode: (id: string, updated: Episode) => void;
  onDeleteEpisode: (id: string) => void;
  onUpdateEpisodeStatus: (id: string, status: EpisodeStatus) => void;
  currentRole: string;
}

const EPISODE_STATUSES: EpisodeStatus[] = ['Idea', 'Scripting', 'Recording', 'Editing', 'Review', 'Published'];

export function EpisodeHub({
  episodes,
  nodes,
  departments,
  users,
  onSelectEpisode,
  onAddEpisode,
  onEditEpisode,
  onDeleteEpisode,
  onUpdateEpisodeStatus,
  currentRole
}: EpisodeHubProps) {
  const isTeacherOrAdmin = currentRole === 'Admin' || currentRole === 'Teacher';
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<EpisodeStatus>('Idea');
  const [hosts, setHosts] = useState('');
  const [guestName, setGuestName] = useState('');
  const [runtime, setRuntime] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingEpisode(null);
    setTitle('');
    setTargetDate(new Date().toISOString().split('T')[0]);
    setStatus('Idea');
    setHosts('');
    setGuestName('');
    setRuntime('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (ep: Episode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEpisode(ep);
    setTitle(ep.title);
    setTargetDate(ep.target_release_date);
    setStatus(ep.status);
    setHosts(ep.hosts || '');
    setGuestName(ep.guest_name || '');
    setRuntime(ep.runtime_minutes || '');
    setNotes(ep.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEpisode) {
      onEditEpisode(editingEpisode.id, {
        ...editingEpisode,
        title: title.trim(),
        target_release_date: targetDate,
        status,
        hosts: hosts.trim() || undefined,
        guest_name: guestName.trim() || undefined,
        runtime_minutes: typeof runtime === 'number' ? runtime : undefined,
        notes: notes.trim() || undefined
      });
    } else {
      onAddEpisode({
        title: title.trim(),
        target_release_date: targetDate,
        status,
        hosts: hosts.trim() || undefined,
        guest_name: guestName.trim() || undefined,
        runtime_minutes: typeof runtime === 'number' ? runtime : undefined,
        notes: notes.trim() || undefined,
        assigned_crew: {
          'Hosts': [],
          'Research': [],
          'Editing': [],
          'Teacher': ['teacher']
        }
      });
    }

    setIsModalOpen(false);
  };

  const filteredEpisodes = episodes.filter(ep => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      ep.title.toLowerCase().includes(q) ||
      ep.id.toLowerCase().includes(q) ||
      (ep.guest_name && ep.guest_name.toLowerCase().includes(q)) ||
      (ep.hosts && ep.hosts.toLowerCase().includes(q));
    const matchesStatus = statusFilter === 'All' || ep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-[#222b3d] rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Top Header */}
      <div className="p-5 border-b border-[#222b3d] bg-gradient-to-r from-[#121620] via-[#161b26] to-[#121620] flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#883e66]/20 border border-[#883e66]/40 flex items-center justify-center text-[#f472b6] shadow-sm">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
                STUDIO PRODUCTION EPISODES
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181e2b] border border-[#222b3d] text-[#f472b6]">
                {episodes.length} Episodes Tracked
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Click any episode below to enter its full workspace: Department cast, task Gantt roadmap, and QA reviews
            </p>
          </div>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 text-xs font-semibold bg-[#883e66] hover:bg-[#a14b7a] text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-[#883e66]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE EPISODE</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 border-b border-[#222b3d] bg-[#121620]/60 flex flex-wrap justify-between items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search episode title, guest, ID, or hosts..."
            className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#883e66]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Lifecycle:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="All">All Lifecycles</option>
            {EPISODE_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Episode Cards Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredEpisodes.length === 0 ? (
          <div className="bg-[#121620] border border-dashed border-[#222b3d] rounded-2xl p-12 text-center text-xs text-slate-500">
            No episodes matching your current search.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredEpisodes.map((ep) => {
              const epNodes = nodes.filter(n => (n.episode_id || 'EP-01') === ep.id);
              const completedCount = epNodes.filter(n => n.status === 'Completed').length;
              const totalCount = epNodes.length;
              const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
              const crew = ep.assigned_crew || {};

              return (
                <div
                  key={ep.id}
                  onClick={() => onSelectEpisode(ep)}
                  className="bg-[#121620] border border-[#222b3d] hover:border-[#3e6688] rounded-2xl p-5 shadow-lg flex flex-col justify-between gap-4 transition-all cursor-pointer group hover:scale-[1.005] relative overflow-hidden"
                >
                  <div className="space-y-3">
                    {/* Top Pill Row */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#883e66]/20 border border-[#883e66]/40 text-[#f472b6]">
                          {ep.id}
                        </span>

                        <select
                          onClick={(e) => e.stopPropagation()}
                          value={ep.status}
                          onChange={(e) => onUpdateEpisodeStatus(ep.id, e.target.value as EpisodeStatus)}
                          className="bg-[#0b0e14] border border-[#222b3d] text-slate-200 text-xs rounded-lg px-2.5 py-0.5 font-mono cursor-pointer outline-none hover:border-[#883e66]"
                        >
                          {EPISODE_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isTeacherOrAdmin && (
                          <>
                            <button
                              onClick={(e) => openEditModal(ep, e)}
                              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#181e2b]"
                              title="Edit Episode Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete episode "${ep.title}" and its roadmap?`)) {
                                  onDeleteEpisode(ep.id);
                                }
                              }}
                              className="text-slate-500 hover:text-red-400 p-1 rounded-lg hover:bg-[#181e2b]"
                              title="Delete Episode"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Title & Overview */}
                    <div>
                      <h3 className="text-base font-bold text-white font-sans group-hover:text-[#9dbcd4] transition-colors leading-snug">
                        {ep.title}
                      </h3>
                      {ep.guest_name && (
                        <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                          Guest: <strong className="text-slate-200">{ep.guest_name}</strong>
                        </span>
                      )}
                    </div>

                    {/* Progress Bar & Velocity */}
                    <div className="space-y-1.5 bg-[#0b0e14] border border-[#222b3d] rounded-xl p-3">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400 font-mono">Progress Velocity</span>
                        <span className="text-white font-mono font-bold">
                          {completedCount} / {totalCount} Tasks ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#181e2b] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#3e6688] via-[#c79016] to-[#33a474] rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Department Cast & Crew Badges */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                        Assigned Cast & Crew Roster:
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {departments.slice(0, 5).map(dept => {
                          const members = crew[dept.name] || [];

                          return (
                            <div key={dept.id} className="bg-[#0b0e14] border border-[#222b3d] rounded-lg p-2 text-xs">
                              <span className="text-[10px] font-mono text-slate-400 block font-semibold">{dept.name}</span>
                              <div className="truncate text-slate-200 mt-0.5">
                                {members.length === 0 ? (
                                  <span className="text-slate-600 text-[11px] italic">Unassigned</span>
                                ) : (
                                  members.map(u => `@${u}`).join(', ')
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Release Date & Entry Banner */}
                  <div className="flex justify-between items-center pt-3 border-t border-[#222b3d]/60 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Target: <strong className="text-white">{ep.target_release_date}</strong></span>
                    </div>

                    <span className="text-[#9dbcd4] group-hover:text-white font-semibold flex items-center gap-1 transition-colors">
                      <span>Open Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Episode Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121620] border border-[#222b3d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div>
                <h3 className="text-sm font-bold text-white font-sans uppercase">
                  {editingEpisode ? `Edit ${editingEpisode.id}` : 'Create New Episode Project'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set target release date, production phase, and initial episode notes
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Episode Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Episode 04: The Student Innovation Summit"
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#883e66]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Target Release Date</label>
                    <input
                      type="date"
                      required
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Current Lifecycle</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as EpisodeStatus)}
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      {EPISODE_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Guest Spotlight (Optional)</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Dean of Students"
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Runtime Estimate (Mins)</label>
                    <input
                      type="number"
                      value={runtime}
                      onChange={(e) => setRuntime(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="30"
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Production Notes & Summary</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key talking points, research themes, or recording dates..."
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#883e66]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#222b3d]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 bg-[#181e2b] border border-[#222b3d]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#883e66] hover:bg-[#a14b7a] shadow-md cursor-pointer"
                  >
                    {editingEpisode ? 'Save Changes' : 'Create Episode'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

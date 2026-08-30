import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, Plus, Edit2, Trash2, Download, Play, Mic, Clock, Calendar, 
  Tag, UserCheck, FileText, CheckCircle2, Music, Sparkles, ExternalLink, X, Search
} from 'lucide-react';
import { Episode, EpisodeStatus } from '../types';

interface EpisodeHubProps {
  episodes: Episode[];
  setEpisodes: React.Dispatch<React.SetStateAction<Episode[]>>;
  currentRole: string;
}

const STATUS_CONFIG: Record<EpisodeStatus, { label: string; color: string; bg: string }> = {
  'Idea': { label: 'Idea & Concept', color: '#9dbcd4', bg: '#3e668820' },
  'Scripting': { label: 'Scripting', color: '#f5c358', bg: '#c7901620' },
  'Recording': { label: 'Studio Recording', color: '#fca5a5', bg: '#88371220' },
  'Editing': { label: 'Audio Mix & Editing', color: '#fdba74', bg: '#b45f0620' },
  'Review': { label: 'Faculty Review', color: '#f472b6', bg: '#883e6620' },
  'Published': { label: 'Published & Live', color: '#4ade80', bg: '#16653430' }
};

export function EpisodeHub({ episodes, setEpisodes, currentRole }: EpisodeHubProps) {
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal Form States
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<EpisodeStatus>('Idea');
  const [hosts, setHosts] = useState('');
  const [guestName, setGuestName] = useState('');
  const [runtimeMinutes, setRuntimeMinutes] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [departmentNotes, setDepartmentNotes] = useState('');
  const [audioUrl, setAudioUrl] = useState('');

  const openNewModal = () => {
    const nextNum = episodes.length + 1;
    setEditingEpisode(null);
    setTitle('');
    setTargetDate(new Date().toISOString().split('T')[0]);
    setStatus('Idea');
    setHosts('');
    setGuestName('');
    setRuntimeMinutes('');
    setNotes('');
    setDepartmentNotes('');
    setAudioUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (ep: Episode) => {
    setEditingEpisode(ep);
    setTitle(ep.title);
    setTargetDate(ep.target_release_date);
    setStatus(ep.status);
    setHosts(ep.hosts || '');
    setGuestName(ep.guest_name || '');
    setRuntimeMinutes(ep.runtime_minutes || '');
    setNotes(ep.notes || '');
    setDepartmentNotes(ep.department_notes || '');
    setAudioUrl(ep.audio_url || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingEpisode) {
      const updated = episodes.map(ep => 
        ep.id === editingEpisode.id ? {
          ...ep,
          title: title.trim(),
          target_release_date: targetDate,
          status,
          hosts: hosts.trim() || undefined,
          guest_name: guestName.trim() || undefined,
          runtime_minutes: typeof runtimeMinutes === 'number' ? runtimeMinutes : undefined,
          notes: notes.trim() || undefined,
          department_notes: departmentNotes.trim() || undefined,
          audio_url: audioUrl.trim() || undefined
        } : ep
      );
      setEpisodes(updated);
    } else {
      const newId = `EP-${String(episodes.length + 1).padStart(2, '0')}`;
      const newEpisode: Episode = {
        id: newId,
        title: title.trim(),
        target_release_date: targetDate,
        status,
        hosts: hosts.trim() || undefined,
        guest_name: guestName.trim() || undefined,
        runtime_minutes: typeof runtimeMinutes === 'number' ? runtimeMinutes : undefined,
        notes: notes.trim() || undefined,
        department_notes: departmentNotes.trim() || undefined,
        audio_url: audioUrl.trim() || undefined,
        created_at: new Date().toISOString()
      };
      setEpisodes([newEpisode, ...episodes]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this episode from the production ledger?')) {
      setEpisodes(episodes.filter(ep => ep.id !== id));
      if (selectedEpisode?.id === id) setSelectedEpisode(null);
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Status', 'Target Release Date', 'Hosts', 'Guest', 'Runtime (min)', 'Notes'];
    const rows = episodes.map(ep => [
      ep.id,
      `"${ep.title.replace(/"/g, '""')}"`,
      ep.status,
      ep.target_release_date,
      `"${(ep.hosts || '').replace(/"/g, '""')}"`,
      `"${(ep.guest_name || '').replace(/"/g, '""')}"`,
      ep.runtime_minutes || '',
      `"${(ep.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'isha-vibes-episode-ledger.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredEpisodes = episodes.filter(ep => {
    const matchesSearch = 
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ep.guest_name && ep.guest_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ep.hosts && ep.hosts.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || ep.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-[#222b3d] rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header */}
      <div className="p-5 border-b border-[#222b3d] bg-gradient-to-r from-[#121620] via-[#161b26] to-[#121620] flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#883e66]/20 border border-[#883e66]/40 flex items-center justify-center text-[#f472b6] shadow-sm">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white font-sans uppercase">
                EPISODE PRODUCTION LEDGER
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181e2b] border border-[#222b3d] text-[#f472b6]">
                {episodes.length} RECORDED EPISODES
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Track episodes from conceptual idea to final campus broadcast & publishing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs font-mono bg-[#181e2b] hover:bg-[#222b3d] text-slate-300 px-3.5 py-2 rounded-xl transition-all border border-[#222b3d] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT LEDGER
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center gap-2 text-xs font-semibold bg-[#883e66] hover:bg-[#a14878] text-white px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            NEW EPISODE
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 border-b border-[#222b3d] bg-[#121620]/60 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-mono">Filter:</span>
          {['All', 'Idea', 'Scripting', 'Recording', 'Editing', 'Review', 'Published'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#3e6688] text-white'
                  : 'bg-[#181e2b] text-slate-400 hover:text-white border border-[#222b3d]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, hosts, guests..."
            className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3e6688]"
          />
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEpisodes.map((ep) => {
            const stConf = STATUS_CONFIG[ep.status] || STATUS_CONFIG['Idea'];

            return (
              <div
                key={ep.id}
                onClick={() => setSelectedEpisode(ep)}
                className="bg-[#121620] border border-[#222b3d] hover:border-[#3e6688] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-md cursor-pointer group relative"
              >
                {/* Action Hover Controls */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(ep); }}
                    className="p-1.5 bg-[#181e2b]/90 backdrop-blur rounded-lg border border-[#222b3d] text-slate-300 hover:text-white hover:border-[#3e6688] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(ep.id); }}
                    className="p-1.5 bg-[#181e2b]/90 backdrop-blur rounded-lg border border-[#222b3d] text-slate-300 hover:text-red-400 hover:border-red-900 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Top Details */}
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2.5">
                    <span className="text-xs font-mono font-bold text-[#f472b6] tracking-wider px-2 py-0.5 rounded-md bg-[#883e66]/20 border border-[#883e66]/40">
                      {ep.id}
                    </span>
                    <span 
                      className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-semibold border"
                      style={{
                        backgroundColor: stConf.bg,
                        borderColor: `${stConf.color}40`,
                        color: stConf.color
                      }}
                    >
                      {stConf.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-sans group-hover:text-[#9dbcd4] transition-colors line-clamp-2">
                    {ep.title}
                  </h3>

                  {ep.notes && (
                    <p className="text-xs text-slate-400 font-sans mt-2 line-clamp-2 leading-relaxed">
                      {ep.notes}
                    </p>
                  )}
                </div>

                {/* Metadata Pills */}
                <div className="space-y-2 pt-3 border-t border-[#222b3d]/60">
                  {ep.guest_name && (
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-[#c79016] shrink-0" />
                      <span className="truncate">Guest: <strong className="text-white font-medium">{ep.guest_name}</strong></span>
                    </div>
                  )}

                  {ep.hosts && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Mic className="w-3.5 h-3.5 text-[#883e66] shrink-0" />
                      <span className="truncate">Hosts: {ep.hosts}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ep.target_release_date}</span>
                    </div>
                    {ep.runtime_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{ep.runtime_minutes} mins</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEpisode && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121620] border border-[#222b3d] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[#222b3d] bg-[#161b26] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[#f472b6] px-2.5 py-1 rounded bg-[#883e66]/20 border border-[#883e66]/40">
                    {selectedEpisode.id}
                  </span>
                  <h3 className="text-base font-bold text-white font-sans">{selectedEpisode.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedEpisode(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#222b3d]">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Status</span>
                    <span className="text-xs font-bold text-white mt-1 block">{selectedEpisode.status}</span>
                  </div>
                  <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#222b3d]">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Target Drop</span>
                    <span className="text-xs font-bold text-white mt-1 block">{selectedEpisode.target_release_date}</span>
                  </div>
                  <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#222b3d]">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Hosts</span>
                    <span className="text-xs font-bold text-white mt-1 block truncate">{selectedEpisode.hosts || 'TBD'}</span>
                  </div>
                  <div className="bg-[#0b0e14] p-3 rounded-xl border border-[#222b3d]">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Est. Runtime</span>
                    <span className="text-xs font-bold text-white mt-1 block">{selectedEpisode.runtime_minutes ? `${selectedEpisode.runtime_minutes} mins` : 'TBD'}</span>
                  </div>
                </div>

                {selectedEpisode.notes && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">Episode Synopsis & Notes</h4>
                    <p className="text-sm text-slate-200 bg-[#0b0e14] p-3.5 rounded-xl border border-[#222b3d] leading-relaxed">
                      {selectedEpisode.notes}
                    </p>
                  </div>
                )}

                {selectedEpisode.department_notes && (
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#9dbcd4] mb-1.5">Production Unit Status</h4>
                    <p className="text-sm text-slate-300 bg-[#3e6688]/10 p-3.5 rounded-xl border border-[#3e6688]/30 leading-relaxed">
                      {selectedEpisode.department_notes}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-[#222b3d] flex justify-end gap-2">
                  <button
                    onClick={() => {
                      const ep = selectedEpisode;
                      setSelectedEpisode(null);
                      openEditModal(ep);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-[#3e6688] hover:bg-[#4d7ca6]"
                  >
                    Edit Episode
                  </button>
                  <button
                    onClick={() => setSelectedEpisode(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-[#181e2b] border border-[#222b3d]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121620] border border-[#222b3d] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[#222b3d] bg-[#161b26] flex justify-between items-center">
                <h3 className="text-sm font-bold text-white font-sans uppercase">
                  {editingEpisode ? `Edit ${editingEpisode.id}` : 'Create New Episode Ledger'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Episode Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Navigating Creative Paths: Student Round Table"
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#3e6688]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Production Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as EpisodeStatus)}
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                    >
                      <option value="Idea">Idea & Concept</option>
                      <option value="Scripting">Scripting</option>
                      <option value="Recording">Studio Recording</option>
                      <option value="Editing">Audio Mix & Editing</option>
                      <option value="Review">Faculty Review</option>
                      <option value="Published">Published & Live</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Target Release Date</label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Hosts</label>
                    <input
                      type="text"
                      value={hosts}
                      onChange={(e) => setHosts(e.target.value)}
                      placeholder="e.g. Aarav & Maya"
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Guest Spotlight</label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Dr. K. Rao"
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Runtime (mins)</label>
                    <input
                      type="number"
                      value={runtimeMinutes}
                      onChange={(e) => setRuntimeMinutes(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="30"
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Episode Synopsis</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Key discussion points, topics covered, and student questions..."
                    rows={3}
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#3e6688]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Department & Studio Notes</label>
                  <input
                    type="text"
                    value={departmentNotes}
                    onChange={(e) => setDepartmentNotes(e.target.value)}
                    placeholder="e.g. Research script ready. Audio levels set."
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#222b3d]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-[#181e2b] border border-[#222b3d]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#883e66] hover:bg-[#a14878] shadow-md cursor-pointer"
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

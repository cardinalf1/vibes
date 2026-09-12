import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, Download, Search, Filter, Activity, 
  CheckCircle2, AlertCircle, RotateCcw, UserPlus, Users, Radio, Shield, Tag, Trash2, Calendar, Clock 
} from 'lucide-react';
import { AuditLog, Episode, Node, SelfAssessment, AuthorizedUser } from '../types';
import { supabaseService } from '../lib/supabaseService';

interface ActivityLogsPanelProps {
  logs: AuditLog[];
  episodes: Episode[];
  nodes: Node[];
  assessments: SelfAssessment[];
  users: AuthorizedUser[];
  onClearLogs?: () => Promise<void>;
  isAdmin?: boolean;
}

interface DownloadSession {
  id: string;
  timestamp: string;
  label: string;
  exportType: string;
  recordCount: number;
}

export function ActivityLogsPanel({
  logs,
  episodes,
  nodes,
  assessments,
  users,
  onClearLogs,
  isAdmin = false
}: ActivityLogsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const [isClearing, setIsClearing] = useState(false);

  // Download History & Filter State
  const [downloadHistory, setDownloadHistory] = useState<DownloadSession[]>(() => {
    try {
      const saved = localStorage.getItem('vibes_download_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [dateFilterMode, setDateFilterMode] = useState<string>('all');
  const [customDate, setCustomDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    try {
      localStorage.setItem('vibes_download_history', JSON.stringify(downloadHistory));
    } catch (e) {}
  }, [downloadHistory]);

  const lastDownload = downloadHistory[0];

  // Resolve Effective Cutoff Date based on Selection
  const getEffectiveCutoffDate = (): string | undefined => {
    if (dateFilterMode === 'all') return undefined;
    if (dateFilterMode === 'last_download') return lastDownload?.timestamp;
    if (dateFilterMode === '24h') return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    if (dateFilterMode === '7d') return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    if (dateFilterMode === 'custom') return new Date(customDate).toISOString();
    
    // If selecting a specific past download session
    const match = downloadHistory.find(h => h.id === dateFilterMode);
    return match ? match.timestamp : undefined;
  };

  const handleExportAuditLogs = () => {
    const cutoff = getEffectiveCutoffDate();
    supabaseService.exportAuditLogsCSV(logs, cutoff);

    const newSession: DownloadSession = {
      id: `DL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      label: `Audit Logs Export (${cutoff ? `Since ${new Date(cutoff).toLocaleDateString()}` : 'All Time'})`,
      exportType: 'Audit Logs',
      recordCount: logs.length
    };
    setDownloadHistory(prev => [newSession, ...prev.slice(0, 19)]);
  };

  const handleExportEpisodesAndTasks = () => {
    const cutoff = getEffectiveCutoffDate();
    supabaseService.exportEpisodesAndTasksCSV(episodes, nodes, cutoff);

    const newSession: DownloadSession = {
      id: `DL-${Date.now()}`,
      timestamp: new Date().toISOString(),
      label: `Episodes & Tasks Export (${cutoff ? `Since ${new Date(cutoff).toLocaleDateString()}` : 'All Time'})`,
      exportType: 'Episodes & Tasks',
      recordCount: nodes.length
    };
    setDownloadHistory(prev => [newSession, ...prev.slice(0, 19)]);
  };

  const handleClear = async () => {
    if (!confirm('CAUTION: Are you sure you want to permanently clear all activity telemetry and audit logs? This action cannot be undone.')) {
      return;
    }
    setIsClearing(true);
    try {
      if (onClearLogs) await onClearLogs();
    } catch (e) {
      alert('Failed to clear audit logs.');
    } finally {
      setIsClearing(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      log.action.toLowerCase().includes(q) ||
      log.username.toLowerCase().includes(q) ||
      JSON.stringify(log.details).toLowerCase().includes(q);
    const matchesAction = filterAction === 'All' || log.action.includes(filterAction);
    return matchesSearch && matchesAction;
  });

  const getEventBadge = (action: string) => {
    if (action.includes('APPROVED')) return { bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40', icon: CheckCircle2 };
    if (action.includes('REVERTED')) return { bg: 'bg-[#883712]/20 text-[#fca5a5] border-[#883712]/40', icon: RotateCcw };
    if (action.includes('SUBMITTED')) return { bg: 'bg-[#c79016]/20 text-[#f5c358] border-[#c79016]/40', icon: Activity };
    if (action.includes('ASSIGNED')) return { bg: 'bg-[#3e6688]/20 text-[#9dbcd4] border-[#3e6688]/40', icon: Users };
    if (action.includes('MEMBER')) return { bg: 'bg-[#883e66]/20 text-[#f472b6] border-[#883e66]/40', icon: UserPlus };
    return { bg: 'bg-[#181e2b] text-slate-300 border-[#222b3d]', icon: Tag };
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-[#222b3d] rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Top Header */}
      <div className="p-5 border-b border-[#222b3d] bg-gradient-to-r from-[#121620] via-[#161b26] to-[#121620] flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3e6688]/20 border border-[#3e6688]/40 flex items-center justify-center text-[#9dbcd4] shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
                STUDIO ACTIVITY TELEMETRY & AUDIT LOGS
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181e2b] border border-[#222b3d] text-slate-300">
                {logs.length} Logged Events
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Comprehensive micro-event telemetry tracking all submissions, teacher approvals, drag-and-drop moves, and roster updates
            </p>
          </div>
        </div>

        {/* Action Clear & Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <button
              onClick={handleClear}
              disabled={isClearing || logs.length === 0}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#883712]/20 hover:bg-[#883712]/40 text-[#fca5a5] border border-[#883712]/50 px-3 py-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title="Clear all stored audit logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isClearing ? 'Purging...' : 'CLEAR LOGS'}</span>
            </button>
          )}

          <button
            onClick={handleExportAuditLogs}
            className="flex items-center gap-2 text-xs font-semibold bg-[#3e6688] hover:bg-[#4d7ca6] text-white px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT AUDIT LOGS (.CSV)</span>
          </button>

          <button
            onClick={handleExportEpisodesAndTasks}
            className="flex items-center gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT EPISODES & TASKS (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Date-Filtered Download Control Bar */}
      <div className="px-5 py-3 border-b border-[#222b3d] bg-[#0e121a] flex flex-wrap justify-between items-center gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#3e6688]" />
            <span>Export Period:</span>
          </span>

          <select
            value={dateFilterMode}
            onChange={(e) => setDateFilterMode(e.target.value)}
            className="bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-[#3e6688]"
          >
            <option value="all">All Time (Complete History)</option>
            {lastDownload && (
              <option value="last_download">
                Since Last Download ({new Date(lastDownload.timestamp).toLocaleString()})
              </option>
            )}
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="custom">Custom Date Cutoff...</option>
            {downloadHistory.length > 1 && (
              <optgroup label="Past Download Sessions">
                {downloadHistory.slice(1, 6).map(h => (
                  <option key={h.id} value={h.id}>
                    Since {h.exportType} on {new Date(h.timestamp).toLocaleString()}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          {dateFilterMode === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-1 text-xs text-white outline-none focus:border-[#3e6688]"
            />
          )}
        </div>

        {lastDownload && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <Clock className="w-3 h-3 text-[#f5c358]" />
            <span>Last Exported: <strong className="text-slate-200">{new Date(lastDownload.timestamp).toLocaleTimeString()} ({lastDownload.exportType})</strong></span>
          </div>
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
            placeholder="Search actor username, task ID, action type, or payload notes..."
            className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3e6688]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Action:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer"
          >
            <option value="All">All Event Types</option>
            <option value="SUBMITTED">Task Submissions</option>
            <option value="APPROVED">Teacher Approvals</option>
            <option value="REVERTED">Teacher Reversions</option>
            <option value="ASSIGNED">Workload / Staff Assignments</option>
            <option value="MEMBER">Roster & Department Moves</option>
            <option value="ASSESSMENT">Self-Assessments</option>
            <option value="EPISODE">Episode Lifecycle</option>
            <option value="CLEARED">Log Cleared Events</option>
          </select>
        </div>
      </div>

      {/* Logs Table / Stream */}
      <div className="flex-1 overflow-y-auto p-5">
        {filteredLogs.length === 0 ? (
          <div className="bg-[#121620] border border-dashed border-[#222b3d] rounded-2xl p-12 text-center text-xs text-slate-500">
            No telemetry logs recorded matching this filter.
          </div>
        ) : (
          <div className="bg-[#121620] border border-[#222b3d] rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="text-slate-400 bg-[#0e121a] border-b border-[#222b3d] text-[10px] font-mono uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5 font-normal">Timestamp</th>
                    <th className="p-3.5 font-normal">Actor</th>
                    <th className="p-3.5 font-normal">Event Action</th>
                    <th className="p-3.5 font-normal">Details & Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222b3d]/60">
                  {filteredLogs.map(log => {
                    const badge = getEventBadge(log.action);
                    const Icon = badge.icon;

                    return (
                      <tr key={log.id} className="hover:bg-[#181e2b]/50 transition-colors font-mono">
                        <td className="p-3.5 text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="p-3.5 text-white whitespace-nowrap">
                          <span className="bg-[#0b0e14] px-2 py-0.5 rounded-md border border-[#222b3d] font-semibold text-slate-200">
                            @{log.username}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg}`}>
                            <Icon className="w-3 h-3" />
                            <span>{log.action}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-300 text-xs font-sans">
                          <div className="line-clamp-2 max-w-xl text-slate-300">
                            {log.details?.notes ? (
                              <span className="italic">"{log.details.notes}" </span>
                            ) : null}
                            {log.details?.task_title ? (
                              <span className="text-slate-400">Task: <strong className="text-white">{log.details.task_title}</strong> </span>
                            ) : null}
                            {log.details?.target_department ? (
                              <span className="text-[#9dbcd4]">Dept: {log.details.target_department} </span>
                            ) : null}
                            {log.details?.episode_id ? (
                              <span className="text-[#f5c358]">({log.details.episode_id})</span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


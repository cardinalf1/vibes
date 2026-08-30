import { Radio, Users, CheckCircle2, Clock, Calendar, Sparkles } from 'lucide-react';
import { Episode, Node, Department } from '../types';

interface TopStatsProps {
  activeEpisode: Episode | null;
  nodes: Node[];
  departments: Department[];
  memberCount: number;
}

export function TopStats({ activeEpisode, nodes, departments, memberCount }: TopStatsProps) {
  const completedTasks = nodes.filter(n => n.status === 'Completed').length;
  const inProgressTasks = nodes.filter(n => n.status === 'In Progress').length;
  const progressPercent = nodes.length > 0 ? Math.round((completedTasks / nodes.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Target Episode Card */}
      <div className="bg-[#121620] border border-[#222b3d] rounded-2xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#883e66]/20 border border-[#883e66]/40 flex items-center justify-center text-[#f472b6]">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Current Spotlight
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-bold text-white font-sans truncate max-w-[130px]">
                {activeEpisode ? activeEpisode.id : 'No Release'}
              </span>
              <span className="text-[10px] font-mono text-[#f472b6]">
                {activeEpisode ? activeEpisode.status : 'Idle'}
              </span>
            </div>
          </div>
        </div>
        <div className="text-[11px] font-mono text-slate-400 bg-[#0b0e14] border border-[#222b3d] px-2.5 py-1 rounded-lg">
          {activeEpisode?.target_release_date || 'TBD'}
        </div>
      </div>

      {/* 2. Task Completion Card */}
      <div className="bg-[#121620] border border-[#222b3d] rounded-2xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3e6688]/20 border border-[#3e6688]/40 flex items-center justify-center text-[#9dbcd4]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Production Velocity
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-bold text-white font-sans">
                {progressPercent}%
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {completedTasks}/{nodes.length} Done
              </span>
            </div>
          </div>
        </div>
        <div className="w-12 h-12 relative flex items-center justify-center">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#181e2b]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#3e6688]"
              strokeDasharray={`${progressPercent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      </div>

      {/* 3. Production Units Card */}
      <div className="bg-[#121620] border border-[#222b3d] rounded-2xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c79016]/20 border border-[#c79016]/40 flex items-center justify-center text-[#f5c358]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Active Production Units
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-bold text-white font-sans">
                {departments.length}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Departments
              </span>
            </div>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[#f5c358] bg-[#c79016]/10 border border-[#c79016]/30 px-2.5 py-1 rounded-lg">
          {memberCount} Members
        </span>
      </div>

      {/* 4. Active In-Progress Tasks Card */}
      <div className="bg-[#121620] border border-[#222b3d] rounded-2xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#b45f06]/20 border border-[#b45f06]/40 flex items-center justify-center text-[#fdba74]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Live In-Progress
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-base font-bold text-white font-sans">
                {inProgressTasks}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Active Items
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-[#fdba74] bg-[#b45f06]/10 border border-[#b45f06]/30 px-2.5 py-1 rounded-lg">
          <Sparkles className="w-3 h-3" />
          <span>Active</span>
        </div>
      </div>
    </div>
  );
}

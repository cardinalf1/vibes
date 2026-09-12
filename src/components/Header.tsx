import { 
  Radio, Settings, LogOut, Users, Award, 
  ShieldCheck, Activity, Key, Mic
} from 'lucide-react';
import { useAuth } from './AuthGate';

interface HeaderProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  activeModule: string;
  onModuleChange: (module: string) => void;
  onOpenSettings: () => void;
  onOpenChangePassword: () => void;
  isSupabaseActive?: boolean;
  pendingReviewCount?: number;
}

export function Header({ 
  currentRole, 
  onRoleChange, 
  activeModule, 
  onModuleChange, 
  onOpenSettings,
  onOpenChangePassword,
  isSupabaseActive,
  pendingReviewCount = 0
}: HeaderProps) {
  const { user, signOut, role: authRole, name: displayName, username } = useAuth();
  const isTeacherOrAdmin = authRole === 'Admin' || authRole === 'Teacher';

  // Navigation Items by Role
  const navItems = isTeacherOrAdmin ? [
    { name: 'Episodes', icon: Radio },
    { name: 'Review Queue', icon: ShieldCheck, badge: pendingReviewCount },
    { name: 'Assessment Reports', icon: Award },
    { name: 'Departments & Roster', icon: Users },
    { name: 'Telemetry & Logs', icon: Activity },
    { name: 'Access Control', icon: Key },
  ] : [
    { name: 'Episodes', icon: Radio },
    { name: 'Self-Assessment', icon: Award },
  ];

  return (
    <header className="h-16 border-b border-[#222b3d] flex items-center justify-between px-4 sm:px-6 shrink-0 bg-[#0e121a]/95 backdrop-blur-md z-20 font-sans">
      <div className="flex items-center gap-6">
        {/* Brand & Project Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3e6688] to-[#883e66] flex items-center justify-center text-white shadow-md">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-white">CARDINAL :: OVERTURE</span>
                <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#883e66]/20 border border-[#883e66]/40 text-[#f472b6]">
                  ISHA VIBES
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-sans block">
                Student Podcast Studio & Production Suite
              </span>
            </div>
          </div>

          <span className={`hidden sm:inline-flex text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider font-semibold ${
            isSupabaseActive 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
              : 'bg-[#181e2b] text-slate-400 border-[#222b3d]'
          }`}>
            {isSupabaseActive ? '● LIVE SYNC' : '○ OFFLINE'}
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#0b0e14]/60 p-1 rounded-xl border border-[#222b3d]/60">
          {navItems.map((item) => {
            const isActive = activeModule === item.name;
            const Icon = item.icon;
            const badgeCount = (item as any).badge || 0;

            return (
              <button
                key={item.name}
                onClick={() => onModuleChange(item.name)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer relative ${
                  isActive 
                    ? 'bg-[#3e6688] text-white shadow-md shadow-[#3e6688]/20 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#181e2b]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
                {badgeCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#f5c358] text-black text-[9px] font-bold flex items-center justify-center font-mono">
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Controls: User Profile, Settings, Logout */}
      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2.5 bg-[#121620] border border-[#222b3d] px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-[#181e2b] border border-[#2d384e] flex items-center justify-center text-[10px] font-bold text-slate-200 uppercase">
                {displayName ? displayName.slice(0, 2) : (username ? username.slice(0, 2) : 'ST')}
              </div>
              <div className="text-left">
                <span className="text-xs font-semibold text-white block leading-none font-sans">
                  {displayName || `@${username}`}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  @{username || 'user'} • {authRole}
                </span>
              </div>
            </div>

            {/* Change Password */}
            <button
              onClick={onOpenChangePassword}
              title="Change Password"
              className="w-8 h-8 rounded-xl bg-[#121620] hover:bg-[#181e2b] text-slate-400 hover:text-[#f5c358] border border-[#222b3d] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {isTeacherOrAdmin && (
          <button 
            onClick={onOpenSettings} 
            title="Database & Studio Settings" 
            className="w-8 h-8 rounded-xl bg-[#121620] hover:bg-[#181e2b] text-slate-400 hover:text-white border border-[#222b3d] flex items-center justify-center transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}

        <button 
          onClick={() => {
            if (confirm('Sign out from Isha Vibes workspace?')) {
              signOut();
            }
          }} 
          title="Sign Out" 
          className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 bg-[#121620] hover:bg-[#181e2b] border border-[#222b3d] px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SIGN OUT</span>
        </button>
      </div>
    </header>
  );
}

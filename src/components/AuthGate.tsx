import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, AlertCircle, CheckCircle2, ArrowRight, Radio, Sparkles, Send, Users, Shield } from 'lucide-react';
import { supabase, isSupabaseConfigured, supabaseUrl } from '../lib/supabase';
import { supabaseService } from '../lib/supabaseService';

interface AuthGateProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: any;
  signOut: () => Promise<void>;
  isSupabaseActive: boolean;
  role: 'Admin' | 'Teacher' | 'Member' | string;
  name: string;
  username: string;
  department: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: async () => {},
  isSupabaseActive: false,
  role: 'Member',
  name: '',
  username: '',
  department: 'Research'
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('vibes_custom_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'login' | 'request'>('login');
  
  // Login form state
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Request access state
  const [reqUsername, setReqUsername] = useState('');
  const [reqName, setReqName] = useState('');
  const [reqDept, setReqDept] = useState('Hosts');
  const [reqNotes, setReqNotes] = useState('');
  const [reqLoading, setReqLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('vibes_custom_session');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem('vibes_custom_session');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setFormLoading(true);

    try {
      const cleanUsername = usernameInput.toLowerCase().trim();

      if (!isSupabaseConfigured || !supabase) {
        throw new Error('Database is currently not connected. Please check network.');
      }

      // Query Supabase directly for authorized user
      const { data: authUsers, error: fetchErr } = await supabase
        .from('authorized_users')
        .select('*')
        .eq('username', cleanUsername);

      if (fetchErr) {
        throw new Error(`Database error: ${fetchErr.message}`);
      }

      if (!authUsers || authUsers.length === 0) {
        throw new Error(`Account "@${cleanUsername}" not found. Please click "Request Access" to register.`);
      }

      const matchedUser = authUsers[0];

      if (matchedUser.password !== password) {
        throw new Error('Incorrect password. Please verify and try again.');
      }

      if (matchedUser.is_greenlit === false) {
        throw new Error('Account dormant: Awaiting faculty or admin approval.');
      }

      const customSession = {
        id: matchedUser.id,
        username: matchedUser.username,
        role: matchedUser.role || 'Member',
        name: matchedUser.name || matchedUser.notes || matchedUser.username,
        department: matchedUser.department || 'Research',
        isCustom: true
      };

      localStorage.setItem('vibes_custom_session', JSON.stringify(customSession));
      setUser(customSession);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setReqLoading(true);

    try {
      const cleanUsername = reqUsername.toLowerCase().trim();
      const combinedNotes = `Name: ${reqName.trim()} | Dept: ${reqDept} | Note: ${reqNotes.trim()}`;
      
      await supabaseService.createAccountRequest(cleanUsername, combinedNotes);
      
      setInfoMsg(`Registration submitted for @${cleanUsername}! A lead admin or teacher will review and approve your account.`);
      setReqUsername('');
      setReqName('');
      setReqNotes('');
      setTimeout(() => {
        setActiveTab('login');
        setUsernameInput(cleanUsername);
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit account request.');
    } finally {
      setReqLoading(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('vibes_custom_session');
    setUser(null);
    setUsernameInput('');
    setPassword('');
    setErrorMsg(null);
    setInfoMsg(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b0e14] text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3e6688]/20 border border-[#3e6688]/40 flex items-center justify-center text-[#9dbcd4] animate-pulse">
            <Radio className="w-6 h-6" />
          </div>
          <span className="text-xs tracking-wider text-slate-400 font-mono uppercase">
            CONNECTING TO ISHA VIBES STUDIO...
          </span>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the main application
  if (user) {
    return (
      <AuthContext.Provider value={{ 
        user, 
        signOut: handleSignOut, 
        isSupabaseActive: isSupabaseConfigured,
        role: user.role || 'Member',
        name: user.name || user.username,
        username: user.username,
        department: user.department || 'Research'
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // Otherwise, render the dedicated Login & Access Gate
  return (
    <div className="relative min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center px-4 overflow-hidden selection:bg-[#3e6688]/40 selection:text-white font-sans">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-gradient-to-br from-[#3e6688]/15 via-[#883e66]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-md bg-[#121620]/95 backdrop-blur-xl border border-[#222b3d] rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        {/* Header Branding */}
        <div className="p-6 text-center border-b border-[#222b3d] bg-gradient-to-b from-[#181e2b] to-[#121620]">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#3e6688] to-[#883e66] flex items-center justify-center text-white mx-auto shadow-lg shadow-[#3e6688]/20 mb-3">
            <Radio className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold tracking-wider text-white">CARDINAL :: OVERTURE</span>
            <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#883e66]/25 border border-[#883e66]/50 text-[#f472b6]">
              ISHA VIBES
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-100">
            Student Podcast Studio Portal
          </h1>
          <p className="text-[11px] text-slate-400 mt-1">
            Sign in to access episode schedules, audio tracks, and production tasks.
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Request Access */}
        <div className="flex border-b border-[#222b3d] bg-[#0e121a]/80 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(null); setInfoMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-[#3e6688] text-white shadow-md shadow-[#3e6688]/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181e2b]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('request'); setErrorMsg(null); setInfoMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'request'
                ? 'bg-[#883e66] text-white shadow-md shadow-[#883e66]/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181e2b]'
            }`}
          >
            Request Access
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-950/30 border border-red-800/40 rounded-xl p-3 mb-4 flex gap-2.5 items-start"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs text-red-200 leading-relaxed">
                  {errorMsg}
                </div>
              </motion.div>
            )}

            {infoMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 mb-4 flex gap-2.5 items-start"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-200 leading-relaxed">
                  {infoMsg}
                </div>
              </motion.div>
            )}

            {activeTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="e.g. raghav, teacher, maya"
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#3e6688] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#3e6688] transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full h-11 mt-4 bg-[#3e6688] hover:bg-[#4d7ca6] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#3e6688]/20 cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? 'Authenticating...' : (
                    <>
                      <span>SIGN IN TO ISHA VIBES</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRequestAccess} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Desired Username</label>
                  <input
                    type="text"
                    required
                    value={reqUsername}
                    onChange={(e) => setReqUsername(e.target.value)}
                    placeholder="e.g. samyak, priya"
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#883e66] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    placeholder="e.g. Samyak Jain"
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#883e66] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Department Interest</label>
                  <select
                    value={reqDept}
                    onChange={(e) => setReqDept(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#883e66] transition-colors"
                  >
                    <option value="Hosts">Hosts / Anchors</option>
                    <option value="Research">Research & Scripting</option>
                    <option value="Editing">Audio Editing & Mastering</option>
                    <option value="Teacher">Faculty / Mentor</option>
                    <option value="Admin">Studio Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300 block">Brief Note / Role details</label>
                  <textarea
                    rows={2}
                    value={reqNotes}
                    onChange={(e) => setReqNotes(e.target.value)}
                    placeholder="I want to join the podcast editing team..."
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#883e66] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reqLoading}
                  className="w-full h-10 mt-1 bg-[#883e66] hover:bg-[#a14b7a] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#883e66]/20 cursor-pointer disabled:opacity-50"
                >
                  {reqLoading ? 'Submitting...' : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>SUBMIT ACCESS REQUEST</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info: Secure Connection status */}
        <div className="p-3.5 border-t border-[#222b3d] bg-[#0e121a] flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SECURE LIVE DATABASE</span>
          </div>
          <span className="text-[10px] text-slate-500">
            CARDINAL SYSTEMS
          </span>
        </div>
      </motion.div>
    </div>
  );
}

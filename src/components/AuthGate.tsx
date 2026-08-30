import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, AlertCircle, CheckCircle2, ArrowRight, Mic, Radio, Key } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { AuthorizedUser } from '../types';

interface AuthGateProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: any;
  signOut: () => Promise<void>;
  isSupabaseActive: boolean;
  role: 'Admin' | 'Teacher' | 'Member' | 'Guest' | string;
  name: string;
  username: string;
  department: string;
  isLoggingIn: boolean;
  setIsLoggingIn: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: async () => {},
  isSupabaseActive: false,
  role: 'Guest',
  name: 'Guest Reader',
  username: 'guest',
  department: 'General',
  isLoggingIn: false,
  setIsLoggingIn: () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<any>(() => {
    const savedCustomSession = localStorage.getItem('vibes_custom_session');
    if (savedCustomSession) {
      try {
        return JSON.parse(savedCustomSession);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(false);

  useEffect(() => {
    const savedCustomSession = localStorage.getItem('vibes_custom_session');
    if (savedCustomSession) {
      try {
        setUser(JSON.parse(savedCustomSession));
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('vibes_custom_session');
      }
    }
    setLoading(false);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setFormLoading(true);

    try {
      const cleanUsername = usernameInput.toLowerCase().trim();

      if (!isSupabaseConfigured || !supabase) {
        // Offline development fallback
        setTimeout(() => {
          let mockRole = 'Member';
          let mockName = cleanUsername;
          let mockDept = 'Research';
          
          if (cleanUsername === 'admin' || cleanUsername === 'raghav' || cleanUsername === 'contact') {
            mockRole = 'Admin';
            mockDept = 'Admin';
            mockName = cleanUsername === 'raghav' ? 'Raghav' : 'Project Admin';
          } else if (cleanUsername === 'teacher') {
            mockRole = 'Teacher';
            mockDept = 'Teacher';
            mockName = 'Faculty Mentor';
          } else if (cleanUsername === 'maya') {
            mockRole = 'Member';
            mockDept = 'Hosts';
            mockName = 'Maya Patel';
          } else if (cleanUsername === 'aarav') {
            mockRole = 'Member';
            mockDept = 'Editing';
            mockName = 'Aarav Sharma';
          }

          const customSession = {
            id: `usr-${cleanUsername}`,
            username: cleanUsername,
            role: mockRole,
            name: mockName,
            department: mockDept,
            isCustom: true
          };
          localStorage.setItem('vibes_custom_session', JSON.stringify(customSession));
          setUser(customSession);
          setFormLoading(false);
          setIsLoggingIn(false);
        }, 400);
        return;
      }

      // Username + Password authentication against authorized_users table
      const { data: authUsers, error: fetchErr } = await supabase
        .from('authorized_users')
        .select('*')
        .eq('username', cleanUsername);

      if (fetchErr) {
        throw new Error('Database connection error. Please try again.');
      }

      if (!authUsers || authUsers.length === 0) {
        throw new Error(`ACCESS DENIED: Username "${cleanUsername}" is not registered. Please contact a Faculty Lead or Admin.`);
      }

      const matchedUser = authUsers[0];

      if (matchedUser.password !== password) {
        throw new Error('Incorrect password. Please verify and try again.');
      }

      if (matchedUser.is_greenlit === false) {
        throw new Error('ACCESS DENIED: Your account is currently dormant. Awaiting greenlight by Faculty / Admin.');
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
      setIsLoggingIn(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('vibes_custom_session');
    setUser(null);
    setBypassAuth(false);
    setIsLoggingIn(false);
    setUsernameInput('');
    setPassword('');
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

  const userRole = user?.role || (user ? 'Member' : 'Guest');
  const userName = user?.name || user?.username || 'Guest Contributor';
  const userUsername = user?.username || 'guest';
  const userDept = user?.department || 'General';

  if (bypassAuth || user || !isLoggingIn) {
    return (
      <AuthContext.Provider value={{ 
        user, 
        signOut: handleSignOut, 
        isSupabaseActive: isSupabaseConfigured && !bypassAuth,
        role: bypassAuth ? 'Admin' : userRole,
        name: bypassAuth ? 'Studio Lead (Dev)' : userName,
        username: userUsername,
        department: userDept,
        isLoggingIn,
        setIsLoggingIn
      }}>
        {children}
      </AuthContext.Provider>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0b0e14] flex items-center justify-center px-4 overflow-hidden selection:bg-[#3e6688]/40 selection:text-white font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-[#121620] border border-[#222b3d] rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-6 text-center border-b border-[#222b3d] bg-gradient-to-b from-[#181e2b] to-[#121620]">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3e6688] to-[#883e66] flex items-center justify-center text-white mx-auto shadow-md mb-3">
            <Mic className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white font-sans tracking-wide">
            CARDINAL :: OVERTURE
          </h1>
          <span className="text-[10px] font-mono text-[#f472b6] tracking-widest uppercase block mt-0.5">
            ISHA VIBES STUDENT PODCAST PORTAL
          </span>
        </div>

        <div className="p-7">
          <AnimatePresence mode="wait">
            <form onSubmit={handleAuth} className="space-y-4">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-950/30 border border-red-800/40 rounded-xl p-3.5 flex gap-2.5 items-start"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-200 leading-relaxed font-sans">
                    {errorMsg}
                  </div>
                </motion.div>
              )}

              {infoMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3.5 flex gap-2.5 items-start"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-200 leading-relaxed font-sans">
                    {infoMsg}
                  </div>
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="e.g. raghav, teacher, maya"
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3e6688] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3e6688] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full h-11 mt-2 bg-[#3e6688] hover:bg-[#4d7ca6] text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {formLoading ? 'Authenticating...' : (
                  <>
                    <span>ENTER STUDIO</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-[#222b3d] bg-[#0e121a] flex flex-col gap-2">
          <button
            onClick={() => setIsLoggingIn(false)}
            className="w-full py-2 text-xs text-slate-400 hover:text-white bg-[#181e2b] hover:bg-[#20283a] border border-[#222b3d] rounded-xl transition-all cursor-pointer font-sans"
          >
            ← Cancel & Return to Overview
          </button>
        </div>
      </motion.div>
    </div>
  );
}

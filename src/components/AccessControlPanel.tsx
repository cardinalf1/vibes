import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, UserPlus, Trash2, CheckCircle2, UserCheck, 
  Lock, Copy, Check, Info, HelpCircle, Key, RefreshCw, Eye, EyeOff, Edit2, Shield, Users, User
} from 'lucide-react';
import { AuthorizedUser, Department } from '../types';
import { useAuth } from './AuthGate';

interface AccessControlPanelProps {
  authorizedUsers: AuthorizedUser[];
  onAddAuthorizedUser: (user: Omit<AuthorizedUser, 'id'>) => void;
  onDeleteAuthorizedUser: (id: string) => void;
  onUpdateAuthorizedUser: (user: AuthorizedUser) => void;
  accountRequests: any[];
  onDeleteAccountRequest: (id: string) => void;
  departments: Department[];
}

const generateRandomPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
  let pass = '';
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

export function AccessControlPanel({
  authorizedUsers,
  onAddAuthorizedUser,
  onDeleteAuthorizedUser,
  onUpdateAuthorizedUser,
  accountRequests,
  onDeleteAccountRequest,
  departments
}: AccessControlPanelProps) {
  const { role: currentUserRole } = useAuth();
  const isTeacherOrAdmin = currentUserRole === 'Admin' || currentUserRole === 'Teacher';

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Admin' | 'Teacher' | 'Member' | 'Guest'>('Member');
  const [department, setDepartment] = useState<string>(departments[0]?.name || 'Research');
  const [password, setPassword] = useState(() => generateRandomPassword());
  const [notes, setNotes] = useState('');
  const [greenlightImmediately, setGreenlightImmediately] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Inline editing state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'Admin' | 'Teacher' | 'Member' | 'Guest'>('Member');
  const [editDepartment, setEditDepartment] = useState<string>(departments[0]?.name || 'Research');
  const [editPassword, setEditPassword] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editName, setEditName] = useState('');

  const startEdit = (user: AuthorizedUser) => {
    setEditingUserId(user.id);
    setEditRole(user.role as any);
    setEditPassword(user.password || '');
    setEditNotes(user.notes || '');
    setEditDepartment(user.department || departments[0]?.name || 'Research');
    setEditName(user.name || '');
  };

  const cancelEdit = () => {
    setEditingUserId(null);
  };

  const saveEdit = (user: AuthorizedUser) => {
    onUpdateAuthorizedUser({
      ...user,
      name: editName,
      role: editRole,
      password: editPassword,
      notes: editNotes,
      department: editDepartment
    });
    setEditingUserId(null);
  };

  const handleRegeneratePassword = () => {
    setPassword(generateRandomPassword());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.toLowerCase().trim();
    if (!cleanUsername || !password.trim()) return;

    onAddAuthorizedUser({
      username: cleanUsername,
      name: name.trim() || cleanUsername,
      role,
      department,
      password: password.trim(),
      notes: notes.trim(),
      is_greenlit: greenlightImmediately
    });

    setSuccessMsg(`Provisioned credential access for @${cleanUsername}`);
    setUsername('');
    setName('');
    setNotes('');
    setPassword(generateRandomPassword());
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCopyCredentials = (u: AuthorizedUser) => {
    const credText = `ISHA VIBES ACCESS CREDENTIALS\nPortal: https://vibes.cardinalsystems.org\nUsername: ${u.username}\nPassword: ${u.password}\nRole: ${u.role}\nDepartment: ${u.department}`;
    navigator.clipboard.writeText(credText);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-[#222b3d] rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Header */}
      <div className="p-5 border-b border-[#222b3d] bg-gradient-to-r from-[#121620] via-[#161b26] to-[#121620] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#883712]/20 border border-[#883712]/40 flex items-center justify-center text-[#fdba74] shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase font-sans">
                STUDIO ACCESS CONTROL & USER DIRECTORY
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181e2b] border border-[#222b3d] text-slate-300">
                {authorizedUsers.length} Active Accounts
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Manage student usernames, department affiliations, and account passwords
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Provision New User Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#121620] border border-[#222b3d] rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus className="w-4 h-4 text-[#3e6688]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Provision New Student / Faculty
              </h3>
            </div>

            {successMsg && (
              <div className="mb-4 bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Username (Login Handle)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">@</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="maya, aarav, teacher"
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Full Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maya Patel"
                  className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="Member">Member</option>
                    <option value="Teacher">Teacher</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 block">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Initial Password</label>
                  <button
                    type="button"
                    onClick={handleRegeneratePassword}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Regenerate
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#3e6688]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">Notes / Bio</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Season 1 Host, Research Lead"
                  className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={greenlightImmediately}
                  onChange={(e) => setGreenlightImmediately(e.target.checked)}
                  className="rounded border-[#222b3d] bg-[#0b0e14] text-[#3e6688]"
                />
                <span>Greenlight account immediately</span>
              </label>

              <button
                type="submit"
                className="w-full bg-[#3e6688] hover:bg-[#4d7ca6] text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer mt-2"
              >
                PROVISION ACCOUNT
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Active User Directory Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#121620] border border-[#222b3d] rounded-2xl overflow-hidden shadow-md">
            <div className="p-4 border-b border-[#222b3d] bg-[#161b26] flex justify-between items-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
                ALL AUTHORIZED USERS ({authorizedUsers.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="text-slate-400 bg-[#0e121a] border-b border-[#222b3d] text-[10px] font-mono uppercase tracking-wider">
                  <tr>
                    <th className="p-3 font-normal">USER</th>
                    <th className="p-3 font-normal">ROLE</th>
                    <th className="p-3 font-normal">DEPARTMENT</th>
                    <th className="p-3 font-normal">PASSWORD</th>
                    <th className="p-3 font-normal text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222b3d]/60">
                  {authorizedUsers.map((u) => {
                    const isEditing = editingUserId === u.id;
                    const isPassVisible = visiblePasswords[u.id];

                    if (isEditing) {
                      return (
                        <tr key={u.id} className="bg-[#181e2b]/50">
                          <td className="p-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Display Name"
                              className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2 py-1 text-xs text-white mb-1"
                            />
                            <span className="text-[10px] font-mono text-slate-400">@{u.username}</span>
                          </td>
                          <td className="p-3">
                            <select
                              value={editRole}
                              onChange={(e) => setEditRole(e.target.value as any)}
                              className="bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2 py-1 text-xs text-white"
                            >
                              <option value="Member">Member</option>
                              <option value="Teacher">Teacher</option>
                              <option value="Admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <select
                              value={editDepartment}
                              onChange={(e) => setEditDepartment(e.target.value)}
                              className="bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2 py-1 text-xs text-white"
                            >
                              {departments.map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2 py-1 text-xs font-mono text-white"
                            />
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => saveEdit(u)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2 py-1 rounded-lg text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="bg-[#181e2b] text-slate-400 hover:text-white px-2 py-1 rounded-lg text-xs border border-[#222b3d]"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={u.id} className="hover:bg-[#181e2b]/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#181e2b] border border-[#2d384e] flex items-center justify-center text-[10px] font-bold text-slate-300">
                              {(u.name || u.username).slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-white font-medium block">{u.name || u.username}</span>
                              <span className="text-[10px] font-mono text-slate-400">@{u.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            u.role === 'Admin' 
                              ? 'bg-[#883712]/20 text-[#fdba74] border-[#883712]/40'
                              : u.role === 'Teacher'
                              ? 'bg-[#c79016]/20 text-[#f5c358] border-[#c79016]/40'
                              : 'bg-[#3e6688]/20 text-[#9dbcd4] border-[#3e6688]/40'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">
                          <span className="bg-[#0b0e14] border border-[#222b3d] px-2 py-0.5 rounded-lg text-[10px] font-mono">
                            {u.department}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <span>{isPassVisible ? u.password : '••••••••'}</span>
                            <button
                              onClick={() => setVisiblePasswords(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                              className="text-slate-500 hover:text-slate-300 p-0.5"
                            >
                              {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleCopyCredentials(u)}
                              title="Copy Credentials Kit"
                              className="text-slate-400 hover:text-white p-1"
                            >
                              {copiedId === u.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => startEdit(u)}
                              title="Edit User"
                              className="text-slate-400 hover:text-white p-1"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Remove access for @${u.username}?`)) {
                                  onDeleteAuthorizedUser(u.id);
                                }
                              }}
                              title="Delete User"
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

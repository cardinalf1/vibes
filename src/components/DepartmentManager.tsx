import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, Edit2, Trash2, Shield, Sparkles, Check, X, 
  FolderPlus, ChevronRight, UserPlus, User, Tag, BookOpen, Mic, Search, Music, Briefcase
} from 'lucide-react';
import { Department, AuthorizedUser } from '../types';

interface DepartmentManagerProps {
  departments: Department[];
  users: AuthorizedUser[];
  onAddDepartment: (dept: Omit<Department, 'id'>) => void;
  onUpdateDepartment: (dept: Department) => void;
  onDeleteDepartment: (id: string) => void;
  onUpdateUser: (user: AuthorizedUser) => void;
  onAddUser: (user: Omit<AuthorizedUser, 'id'>) => void;
  onDeleteUser: (id: string) => void;
  currentRole: string; // 'Admin' | 'Teacher' | 'Member' | etc.
}

const PRESET_COLORS = [
  '#3e6688', // Slate Steel Blue
  '#c79016', // Golden Amber
  '#b45f06', // Warm Rust
  '#883712', // Deep Sienna
  '#883e66', // Plum / Rosewood
  '#2a6f97', // Ocean
  '#6b705c', // Sage
  '#7b2cbf', // Violet
];

export function DepartmentManager({
  departments,
  users,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onUpdateUser,
  onAddUser,
  onDeleteUser,
  currentRole
}: DepartmentManagerProps) {
  const isManager = currentRole === 'Admin' || currentRole === 'Teacher';
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(departments[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Form state for Add/Edit Department
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptDescription, setDeptDescription] = useState('');
  const [deptColor, setDeptColor] = useState(PRESET_COLORS[0]);

  // Modal / Form state for Quick Adding Member
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Admin' | 'Teacher' | 'Member' | 'Guest'>('Member');
  const [newMemberPassword, setNewMemberPassword] = useState('vibes2026');

  const openNewDeptModal = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptDescription('');
    setDeptColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setIsDeptModalOpen(true);
  };

  const openEditDeptModal = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptDescription(dept.description || '');
    setDeptColor(dept.color || PRESET_COLORS[0]);
    setIsDeptModalOpen(true);
  };

  const handleSaveDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim()) return;

    if (editingDept) {
      onUpdateDepartment({
        ...editingDept,
        name: deptName.trim(),
        description: deptDescription.trim(),
        color: deptColor
      });
    } else {
      onAddDepartment({
        name: deptName.trim(),
        description: deptDescription.trim(),
        color: deptColor
      });
    }
    setIsDeptModalOpen(false);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = newMemberUsername.toLowerCase().trim();
    if (!cleanUsername) return;

    const currentDeptName = departments.find(d => d.id === selectedDeptId)?.name || 'Research';

    onAddUser({
      username: cleanUsername,
      name: newMemberName.trim() || cleanUsername,
      role: newMemberRole,
      department: currentDeptName,
      password: newMemberPassword.trim(),
      notes: `Joined via ${currentDeptName} roster`,
      is_greenlit: true
    });

    setNewMemberUsername('');
    setNewMemberName('');
    setIsAddMemberModalOpen(false);
  };

  const getDepartmentIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('teacher') || lower.includes('faculty')) return BookOpen;
    if (lower.includes('host') || lower.includes('voice')) return Mic;
    if (lower.includes('research') || lower.includes('script')) return Search;
    if (lower.includes('edit') || lower.includes('audio') || lower.includes('sound')) return Music;
    if (lower.includes('admin')) return Shield;
    return Tag;
  };

  const activeDept = departments.find(d => d.id === selectedDeptId) || departments[0];
  const deptUsers = users.filter(u => 
    activeDept && (u.department?.toLowerCase() === activeDept.name.toLowerCase())
  );

  const filteredUsers = deptUsers.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-[#222b3d] rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Top Header */}
      <div className="p-5 border-b border-[#222b3d] bg-gradient-to-r from-[#121620] via-[#161b26] to-[#121620] flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3e6688]/20 border border-[#3e6688]/40 flex items-center justify-center text-[#9dbcd4] shadow-sm">
            <Users className="w-5 h-5 text-[#9dbcd4]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white font-sans uppercase">
                DEPARTMENTS & TEAM ROSTER
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181e2b] border border-[#222b3d] text-[#9dbcd4]">
                {departments.length} ACTIVE DEPARTMENTS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Isha Vibes Student Podcast Production Structure & Member Directory
            </p>
          </div>
        </div>

        {isManager && (
          <div className="flex items-center gap-2">
            <button
              onClick={openNewDeptModal}
              className="flex items-center gap-2 text-xs font-medium bg-[#3e6688] hover:bg-[#4d7ca6] text-white px-3.5 py-2 rounded-xl transition-all shadow-md hover:shadow-[#3e6688]/20 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              CREATE DEPARTMENT
            </button>
          </div>
        )}
      </div>

      {/* Main Dual-Column Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Column: Department List */}
        <div className="w-full md:w-80 border-r border-[#222b3d] bg-[#0e121a] flex flex-col shrink-0 overflow-y-auto">
          <div className="p-3.5 border-b border-[#222b3d]/60 text-[10px] font-mono tracking-widest text-slate-400 uppercase flex justify-between items-center">
            <span>Production Units</span>
            <span className="text-slate-500">{users.length} Total Members</span>
          </div>

          <div className="p-3 space-y-2 flex-1">
            {departments.map((dept) => {
              const Icon = getDepartmentIcon(dept.name);
              const isSelected = dept.id === activeDept?.id;
              const count = users.filter(u => u.department?.toLowerCase() === dept.name.toLowerCase()).length;

              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDeptId(dept.id)}
                  className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#181e2b] border-[#3e6688]/60 shadow-lg shadow-[#3e6688]/10 text-white'
                      : 'bg-[#121620]/80 border-[#222b3d]/60 hover:bg-[#151b27] hover:border-[#324058] text-slate-300'
                  }`}
                >
                  {/* Left Color Indicator Pill */}
                  <div 
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full"
                    style={{ backgroundColor: dept.color || '#3e6688' }}
                  />

                  <div className="flex items-center gap-3 pl-1.5 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{ 
                        backgroundColor: `${dept.color || '#3e6688'}20`,
                        borderColor: `${dept.color || '#3e6688'}40`,
                        color: dept.color || '#3e6688'
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate font-sans">{dept.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {dept.description || 'Production unit'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span 
                      className="text-xs font-mono px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: `${dept.color || '#3e6688'}15`,
                        borderColor: `${dept.color || '#3e6688'}30`,
                        color: '#f1f5f9'
                      }}
                    >
                      {count} {count === 1 ? 'member' : 'members'}
                    </span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-[#222b3d] bg-[#0c1017]">
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#c79016]" />
              <span>Admins & Teachers can add or reassign members anytime.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Department Details & Member Roster */}
        <div className="flex-1 flex flex-col bg-[#0b0e14] overflow-hidden">
          {activeDept ? (
            <>
              {/* Department Banner Header */}
              <div 
                className="p-6 border-b border-[#222b3d] relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${activeDept.color}15 0%, #121620 100%)`
                }}
              >
                <div className="flex flex-wrap justify-between items-start gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg"
                      style={{
                        backgroundColor: `${activeDept.color}25`,
                        borderColor: `${activeDept.color}50`,
                        color: '#ffffff'
                      }}
                    >
                      {React.createElement(getDepartmentIcon(activeDept.name), { className: 'w-7 h-7' })}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-white font-sans">{activeDept.name} Department</h3>
                        <span 
                          className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-semibold border"
                          style={{
                            backgroundColor: `${activeDept.color}30`,
                            borderColor: `${activeDept.color}60`,
                            color: '#ffffff'
                          }}
                        >
                          {deptUsers.length} Students & Leads
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mt-1 max-w-xl font-sans leading-relaxed">
                        {activeDept.description || 'Core workflow department for Isha Vibes.'}
                      </p>
                    </div>
                  </div>

                  {isManager && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditDeptModal(activeDept)}
                        className="px-3 py-1.5 rounded-xl bg-[#181e2b] hover:bg-[#20283a] text-slate-200 border border-[#222b3d] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit Unit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the "${activeDept.name}" department?`)) {
                            onDeleteDepartment(activeDept.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#883712]/20 hover:bg-[#883712]/40 text-[#fca5a5] border border-[#883712]/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Roster Controls: Search & Add Member */}
              <div className="p-4 border-b border-[#222b3d] bg-[#121620]/60 flex flex-wrap justify-between items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search within ${activeDept.name}...`}
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3e6688] transition-colors"
                  />
                </div>

                {isManager && (
                  <button
                    onClick={() => setIsAddMemberModalOpen(true)}
                    className="flex items-center gap-2 text-xs font-medium bg-[#c79016] hover:bg-[#d89e1a] text-black px-3.5 py-2 rounded-xl transition-all shadow-md font-semibold cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    ADD PERSON TO {activeDept.name.toUpperCase()}
                  </button>
                )}
              </div>

              {/* Roster Table / List */}
              <div className="flex-1 overflow-y-auto p-5">
                {filteredUsers.length === 0 ? (
                  <div className="h-64 border border-dashed border-[#222b3d] rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-[#121620]/40">
                    <Users className="w-10 h-10 text-slate-600 mb-3" />
                    <h4 className="text-sm font-semibold text-slate-300">No members assigned to {activeDept.name} yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      {isManager 
                        ? 'Click the button above to assign students or faculty to this department.'
                        : 'Contact a Teacher or Administrator to join this team.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                    {filteredUsers.map((user) => {
                      const isCurrentUserAdmin = user.role === 'Admin';
                      const isCurrentUserTeacher = user.role === 'Teacher';

                      return (
                        <div
                          key={user.id}
                          className="bg-[#121620] border border-[#222b3d] rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-[#324058] transition-all shadow-sm group relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-[#1c2230] border border-[#2d384e] flex items-center justify-center font-bold text-sm text-slate-200 shrink-0 uppercase">
                                {(user.name || user.username).slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-sm font-semibold text-white truncate font-sans">
                                  {user.name || `@${user.username}`}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate font-mono">
                                  <span>@{user.username}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                                isCurrentUserTeacher
                                  ? 'bg-[#c79016]/20 text-[#f5c358] border-[#c79016]/40'
                                  : isCurrentUserAdmin
                                  ? 'bg-[#883712]/20 text-[#fca5a5] border-[#883712]/40'
                                  : 'bg-[#3e6688]/20 text-[#9dbcd4] border-[#3e6688]/40'
                              }`}>
                                {user.role}
                              </span>
                            </div>
                          </div>

                          {user.notes && (
                            <p className="text-xs text-slate-400 bg-[#0b0e14]/60 p-2 rounded-lg border border-[#222b3d]/60 line-clamp-2">
                              {user.notes}
                            </p>
                          )}

                          {/* Member Actions (For Managers) */}
                          {isManager && (
                            <div className="pt-2 border-t border-[#222b3d]/60 flex items-center justify-between text-xs text-slate-500">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono uppercase text-slate-400">Reassign Dept:</span>
                                <select
                                  value={user.department || activeDept.name}
                                  onChange={(e) => {
                                    onUpdateUser({
                                      ...user,
                                      department: e.target.value
                                    });
                                  }}
                                  className="bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-[#3e6688]"
                                >
                                  {departments.map(d => (
                                    <option key={d.id} value={d.name}>{d.name}</option>
                                  ))}
                                </select>
                              </div>

                              <button
                                onClick={() => {
                                  if (confirm(`Remove "@${user.username}" from the team?`)) {
                                    onDeleteUser(user.id);
                                  }
                                }}
                                className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                                title="Remove User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-slate-500">
              Select a department on the left to view members.
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Department Modal */}
      <AnimatePresence>
        {isDeptModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121620] border border-[#222b3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[#222b3d] flex justify-between items-center bg-[#161b26]">
                <h3 className="text-sm font-bold text-white font-sans uppercase">
                  {editingDept ? 'Edit Department Unit' : 'Create New Department'}
                </h3>
                <button
                  onClick={() => setIsDeptModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDept} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Department Name</label>
                  <input
                    type="text"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g. Marketing & Media, Sound Design"
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#3e6688]"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Description & Scope</label>
                  <textarea
                    value={deptDescription}
                    onChange={(e) => setDeptDescription(e.target.value)}
                    placeholder="Responsibilities, focus areas..."
                    rows={3}
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Color Badge & Accent</label>
                  <div className="flex flex-wrap gap-2.5">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setDeptColor(c)}
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${
                          deptColor === c ? 'scale-110 border-white ring-2 ring-white/20' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {deptColor === c && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#222b3d]">
                  <button
                    type="button"
                    onClick={() => setIsDeptModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-[#181e2b] border border-[#222b3d]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#3e6688] hover:bg-[#4d7ca6] shadow-md cursor-pointer"
                  >
                    {editingDept ? 'Update Department' : 'Create Department'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddMemberModalOpen && activeDept && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121620] border border-[#222b3d] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[#222b3d] flex justify-between items-center bg-[#161b26]">
                <div>
                  <h3 className="text-sm font-bold text-white font-sans uppercase">
                    Add Person to {activeDept.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Provision access credentials for a student or teacher</p>
                </div>
                <button
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Username (Login Handle)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-mono">@</span>
                    <input
                      type="text"
                      value={newMemberUsername}
                      onChange={(e) => setNewMemberUsername(e.target.value)}
                      placeholder="e.g. aarav, maya, student1"
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#3e6688]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Display Name</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#3e6688]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Role Permission</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as any)}
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                    >
                      <option value="Member">Member (Student)</option>
                      <option value="Teacher">Teacher (Supervisor)</option>
                      <option value="Admin">Admin (Lead)</option>
                      <option value="Guest">Guest (Read Only)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">Initial Password</label>
                    <input
                      type="text"
                      value={newMemberPassword}
                      onChange={(e) => setNewMemberPassword(e.target.value)}
                      className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#3e6688]"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-[#222b3d]">
                  <button
                    type="button"
                    onClick={() => setIsAddMemberModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-[#181e2b] border border-[#222b3d]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-semibold text-black bg-[#c79016] hover:bg-[#d89e1a] shadow-md cursor-pointer"
                  >
                    Provision & Add
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

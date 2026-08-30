import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, User, Calendar, Edit2, ListTodo, CheckCircle2, Clock } from 'lucide-react';
import { Node, Department, Status, AuthorizedUser } from '../types';

interface TeamTodosProps {
  nodes: Node[];
  authorizedUsers: AuthorizedUser[];
  departments: Department[];
  currentRole: string;
  onAddTodo: (todo: { 
    title: string; 
    description: string; 
    department: string; 
    planned_start: string; 
    planned_end: string; 
    dependency?: string; 
    assigned_to?: string | null 
  }) => void;
  onUpdateStatus: (id: string, status: Status) => void;
  onDeleteTodo: (id: string) => void;
  onAssignTodo: (id: string, assignedTo: string | null) => void;
  onEditTodo: (id: string, updatedTodo: Node) => void;
  isAdmin: boolean;
}

export function TeamTodos({
  nodes,
  authorizedUsers,
  departments,
  currentRole,
  onAddTodo,
  onUpdateStatus,
  onDeleteTodo,
  onAssignTodo,
  onEditTodo,
  isAdmin,
}: TeamTodosProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<string>(departments[0]?.name || 'Research');
  const [assignedTo, setAssignedTo] = useState('');
  const [plannedStart, setPlannedStart] = useState(new Date().toISOString().split('T')[0]);
  const [plannedEnd, setPlannedEnd] = useState(new Date().toISOString().split('T')[0]);
  const [dependency, setDependency] = useState('');

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDepartment, setEditDepartment] = useState<string>(departments[0]?.name || 'Research');
  const [editAssignedTo, setEditAssignedTo] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<Status>('To Do');
  const [editPlannedStart, setEditPlannedStart] = useState('');
  const [editPlannedEnd, setEditPlannedEnd] = useState('');
  const [editDependency, setEditDependency] = useState('');

  const startEditing = (node: Node) => {
    setEditingId(node.id);
    setEditTitle(node.title);
    setEditDescription(node.description || '');
    setEditDepartment(node.department);
    setEditAssignedTo(node.assigned_to || null);
    setEditStatus(node.status);
    setEditPlannedStart(node.planned_start);
    setEditPlannedEnd(node.planned_end);
    setEditDependency(node.dependency || '');
  };

  const handleSave = (id: string) => {
    if (!editTitle || !editPlannedStart || !editPlannedEnd) return;

    const originalNode = nodes.find(n => n.id === id);
    const updatedNode: Node = {
      id,
      title: editTitle,
      description: editDescription,
      department: editDepartment,
      status: editStatus,
      planned_start: editPlannedStart,
      planned_end: editPlannedEnd,
      actual_start: originalNode?.actual_start || null,
      actual_end: originalNode?.actual_end || null,
      dependency: editDependency || undefined,
      assigned_to: editAssignedTo || null,
    };

    onEditTodo(id, updatedNode);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !plannedStart || !plannedEnd) return;

    onAddTodo({
      title: title.trim(),
      description: description.trim(),
      department,
      planned_start: plannedStart,
      planned_end: plannedEnd,
      dependency: dependency || undefined,
      assigned_to: assignedTo || null,
    });

    setTitle('');
    setDescription('');
    setDepartment(departments[0]?.name || 'Research');
    setAssignedTo('');
    setDependency('');
    setIsAdding(false);
  };

  return (
    <div className="bg-[#121620] border border-[#222b3d] rounded-2xl p-6 space-y-6 shadow-xl font-sans">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase block font-semibold">
            COLLABORATIVE ACTION BOARD
          </span>
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            Operational To-Dos & Production Assignments
          </h2>
        </div>
        
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 text-xs bg-[#3e6688] hover:bg-[#4d7ca6] text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {isAdding ? 'CANCEL' : 'ADD ACTION ITEM'}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-[#0b0e14] border border-[#222b3d] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Task Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clean up Audio Track 2"
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Key deliverables..."
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Assignee</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="">-- Unassigned --</option>
                {authorizedUsers.map(u => (
                  <option key={u.username} value={u.username}>{u.name || `@${u.username}`} ({u.department || 'General'})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Planned Start Date</label>
              <input
                type="date"
                required
                value={plannedStart}
                onChange={(e) => setPlannedStart(e.target.value)}
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Planned End Date</label>
              <input
                type="date"
                required
                value={plannedEnd}
                onChange={(e) => setPlannedEnd(e.target.value)}
                className="w-full bg-[#121620] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="col-span-1 lg:col-span-3 flex justify-end gap-2 pt-2 border-t border-[#222b3d]">
              <button
                type="submit"
                className="bg-[#c79016] hover:bg-[#d89e1a] text-black font-semibold text-xs px-6 py-2 rounded-xl transition-all cursor-pointer shadow-md"
              >
                DEPLOY ACTION ITEM
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans border-collapse">
          <thead>
            <tr className="border-b border-[#222b3d] text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-normal">TASK DETAIL</th>
              <th className="pb-3 font-normal">DEPARTMENT</th>
              <th className="pb-3 font-normal">TIMELINE</th>
              <th className="pb-3 font-normal">ASSIGNED TO</th>
              <th className="pb-3 font-normal">STATUS</th>
              <th className="pb-3 font-normal text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222b3d]/60">
            {nodes.map(node => {
              const isEditing = editingId === node.id;

              if (isEditing) {
                return (
                  <tr key={node.id} className="bg-[#181e2b]/40">
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2.5 py-1 text-xs text-white"
                          placeholder="Task Title"
                        />
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2.5 py-0.5 text-xs text-slate-400"
                          placeholder="Description"
                        />
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2 py-1 text-xs text-white"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          value={editPlannedStart}
                          onChange={(e) => setEditPlannedStart(e.target.value)}
                          className="bg-[#0b0e14] border border-[#222b3d] rounded px-1.5 py-0.5 text-[10px] text-slate-300"
                        />
                        <input
                          type="date"
                          value={editPlannedEnd}
                          onChange={(e) => setEditPlannedEnd(e.target.value)}
                          className="bg-[#0b0e14] border border-[#222b3d] rounded px-1.5 py-0.5 text-[10px] text-slate-300"
                        />
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={editAssignedTo || ''}
                        onChange={(e) => setEditAssignedTo(e.target.value || null)}
                        className="bg-[#0b0e14] border border-[#222b3d] rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="">Unassigned</option>
                        {authorizedUsers.map(u => (
                          <option key={u.username} value={u.username}>{u.name || `@${u.username}`}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as Status)}
                        className="bg-[#0b0e14] border border-[#222b3d] rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleSave(node.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-1 rounded-lg text-xs"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
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
                <tr key={node.id} className="hover:bg-[#181e2b]/40 transition-colors">
                  <td className="py-3.5 pr-4">
                    <div className="flex flex-col">
                      <span className="text-white font-medium block">{node.title}</span>
                      <span className="text-xs text-slate-400 block mt-0.5">{node.description || 'No description provided.'}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-300">
                    <span className="bg-[#0b0e14] border border-[#222b3d] px-2.5 py-1 rounded-lg text-xs font-mono">
                      {node.department}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{node.planned_start} ➔ {node.planned_end}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-slate-300 text-xs">
                    <select
                      value={node.assigned_to || ''}
                      onChange={(e) => onAssignTodo(node.id, e.target.value || null)}
                      className="bg-[#0b0e14] border border-[#222b3d] rounded-lg text-slate-200 text-xs px-2.5 py-1 outline-none cursor-pointer"
                    >
                      <option value="">Unassigned</option>
                      {authorizedUsers.map(u => (
                        <option key={u.username} value={u.username}>{u.name || `@${u.username}`}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3.5 pr-4">
                    <select
                      value={node.status}
                      onChange={(e) => onUpdateStatus(node.id, e.target.value as Status)}
                      className="bg-[#0b0e14] border border-[#222b3d] rounded-lg text-slate-200 text-xs px-2.5 py-1 outline-none cursor-pointer"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => startEditing(node)}
                        className="text-slate-400 hover:text-white p-1"
                        title="Edit Task"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTodo(node.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {nodes.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-sans text-xs">
                  No action items recorded. Click "+ ADD ACTION ITEM" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

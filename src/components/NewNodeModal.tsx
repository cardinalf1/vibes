import React, { useState } from 'react';
import { Department, Node, Priority } from '../types';
import { X, Calendar, Tag, AlertCircle, Link2, Search } from 'lucide-react';

interface NewNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (node: { 
    title: string; 
    description: string; 
    department: string; 
    priority: Priority;
    planned_start: string; 
    planned_end: string; 
    dependency?: string 
  }) => void;
  existingNodes: Node[];
  departments: Department[];
}

export function NewNodeModal({ isOpen, onClose, onCreate, existingNodes, departments }: NewNodeModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<string>(departments[0]?.name || 'Research');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dependency, setDependency] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const [plannedStart, setPlannedStart] = useState(today);
  const [plannedEnd, setPlannedEnd] = useState(today);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const finalEnd = new Date(plannedEnd) < new Date(plannedStart) ? plannedStart : plannedEnd;

    onCreate({
      title: title.trim(),
      description: description.trim(),
      department: department || (departments[0]?.name || 'Research'),
      priority,
      planned_start: plannedStart,
      planned_end: finalEnd,
      dependency: dependency || undefined,
    });

    setTitle('');
    setDescription('');
    setDepartment(departments[0]?.name || 'Research');
    setPriority('Medium');
    setDependency('');
    setSearchQuery('');
    setPlannedStart(today);
    setPlannedEnd(today);
    onClose();
  };

  const filteredNodes = existingNodes.filter(node => 
    node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121620] border border-[#222b3d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-[#222b3d] bg-[#161b26] flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-white font-sans uppercase">Create Production Task / Milestone</h2>
            <p className="text-xs text-slate-400 mt-0.5">Deploy new item to the Isha Vibes Gantt & Kanban roadmap</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Task Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#3e6688]"
              placeholder="e.g. Host Microphone Setup & Soundcheck"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Task Description</label>
            <input
              required
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#3e6688]"
              placeholder="Deliverables and key details..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Assigned Department</label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3e6688] cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Priority Level</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#3e6688] cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Start Date</label>
              <input
                required
                type="date"
                value={plannedStart}
                onChange={e => setPlannedStart(e.target.value)}
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Target Due Date</label>
              <input
                required
                type="date"
                value={plannedEnd}
                onChange={e => setPlannedEnd(e.target.value)}
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
              />
            </div>
          </div>

          {/* Task Dependency Picker */}
          <div className="space-y-2 pt-2 border-t border-[#222b3d]">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Prerequisite Dependency (Optional)</label>
              {dependency && (
                <button
                  type="button"
                  onClick={() => setDependency('')}
                  className="text-[10px] font-mono text-red-400 uppercase tracking-wider hover:text-red-300 cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search existing tasks to link as dependency..."
              className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3e6688]"
            />

            <div className="border border-[#222b3d] rounded-xl bg-[#0b0e14] max-h-[100px] overflow-y-auto divide-y divide-[#222b3d]/60">
              <div 
                onClick={() => setDependency('')}
                className={`p-2 text-xs cursor-pointer transition-colors flex justify-between items-center ${!dependency ? 'bg-[#181e2b] text-white font-semibold' : 'text-slate-400 hover:bg-[#151b27]'}`}
              >
                <span>None (No Dependency)</span>
                {!dependency && <span className="text-xs text-[#3e6688]">✓</span>}
              </div>
              {filteredNodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => setDependency(node.id)}
                  className={`p-2 text-xs cursor-pointer transition-colors flex justify-between items-center ${dependency === node.id ? 'bg-[#181e2b] text-white font-semibold' : 'text-slate-300 hover:bg-[#151b27]'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-slate-500">{node.id}</span>
                    <span className="truncate">{node.title}</span>
                  </div>
                  {dependency === node.id && <span className="text-xs text-[#3e6688]">✓</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-[#222b3d]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#181e2b] hover:bg-[#222b3d] text-slate-300 border border-[#222b3d] rounded-xl text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#3e6688] hover:bg-[#4d7ca6] text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              Deploy Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

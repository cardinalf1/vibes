import { Node, Status } from '../types';
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface NodeListProps {
  nodes: Node[];
  currentRole: string;
  onUpdateStatus: (id: string, status: Status) => void;
  onDeleteNode: (id: string) => void;
  onOpenCreateModal: () => void;
  isReadOnly?: boolean;
}

export function NodeList({ 
  nodes, 
  currentRole, 
  onUpdateStatus, 
  onDeleteNode, 
  onOpenCreateModal, 
  isReadOnly 
}: NodeListProps) {
  const isTeacherOrAdmin = currentRole === 'Admin' || currentRole === 'Teacher';

  return (
    <div className="flex flex-col h-full bg-[#121620] border border-[#222b3d] rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-[#222b3d] flex justify-between items-center bg-[#161b26]">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white font-sans">
            ACTIVE PRODUCTION TASKS
          </h2>
          <span className="text-[10px] text-slate-400 font-sans">
            {nodes.length} Roadmap Deliverables
          </span>
        </div>
        
        {!isReadOnly && (
          <button 
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#3e6688] hover:bg-[#4d7ca6] text-white px-3.5 py-1.5 rounded-xl transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>NEW TASK</span>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="text-slate-400 sticky top-0 bg-[#0e121a] z-10 border-b border-[#222b3d] text-[10px] font-mono uppercase tracking-wider">
            <tr>
              <th className="p-3.5 font-normal">ID</th>
              <th className="p-3.5 font-normal">Title</th>
              <th className="p-3.5 font-normal">Department</th>
              <th className="p-3.5 font-normal">Status</th>
              <th className="p-3.5 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222b3d]/60">
            {nodes.map(node => (
              <tr key={node.id} className="hover:bg-[#181e2b]/50 transition-colors group">
                <td className="p-3.5 font-mono text-slate-400">{node.id}</td>
                <td className="p-3.5">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{node.title}</span>
                    {node.description && (
                      <span className="text-xs text-slate-400 line-clamp-1">{node.description}</span>
                    )}
                    {node.dependency && (
                      <span className="text-[10px] text-[#9dbcd4] font-mono mt-0.5">
                        Dependency: <strong className="text-white">{node.dependency}</strong>
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3.5">
                  <span className="text-xs font-mono text-slate-300 bg-[#0b0e14] px-2.5 py-1 rounded-lg border border-[#222b3d]">
                    {node.department}
                  </span>
                </td>
                <td className="p-3.5">
                  {isReadOnly ? (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                      node.status === 'Completed' 
                        ? 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' 
                        : node.status === 'In Progress'
                          ? 'text-[#f5c358] bg-[#c79016]/20 border-[#c79016]/40'
                          : 'text-slate-400 bg-[#181e2b] border-[#222b3d]'
                    }`}>
                      {node.status}
                    </span>
                  ) : (
                    <select
                      value={node.status}
                      onChange={(e) => onUpdateStatus(node.id, e.target.value as Status)}
                      className="bg-[#0b0e14] border border-[#222b3d] text-slate-200 text-xs rounded-lg px-2.5 py-1 outline-none focus:border-[#3e6688] cursor-pointer"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}
                </td>
                <td className="p-3.5 text-right">
                  {isTeacherOrAdmin && !isReadOnly ? (
                    <button 
                      onClick={() => onDeleteNode(node.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-slate-600">--</span>
                  )}
                </td>
              </tr>
            ))}
            {nodes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 font-sans text-xs">
                  No tasks available. Click "+ NEW TASK" to deploy the first milestone.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

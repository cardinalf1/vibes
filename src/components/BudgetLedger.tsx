import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, Plus, Trash2, CheckCircle2, DollarSign, Calendar, 
  Tag, Download, Sparkles, Filter, PieChart, Layers
} from 'lucide-react';
import { ExpenditureItem, ExpenditureCategory, ExpenditureStatus } from '../types';

interface BudgetLedgerProps {
  expenditures: ExpenditureItem[];
  onAddExpenditure: (item: Omit<ExpenditureItem, 'id' | 'pledged_by_email' | 'pledged_by_name'>) => void;
  onDeleteExpenditure: (id: string) => void;
  onUpdateStatus: (id: string, status: ExpenditureStatus) => void;
  isAdmin: boolean;
}

const CATEGORIES: ExpenditureCategory[] = [
  'Equipment',
  'Studio & Acoustic',
  'Software & Subscriptions',
  'Marketing & Branding',
  'Hosting & Distribution',
  'Events & Guests'
];

export function BudgetLedger({
  expenditures,
  onAddExpenditure,
  onDeleteExpenditure,
  onUpdateStatus,
  isAdmin
}: BudgetLedgerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [itemName, setItemName] = useState('');
  const [cost, setCost] = useState<number | ''>('');
  const [category, setCategory] = useState<ExpenditureCategory>('Equipment');
  const [neededBy, setNeededBy] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ExpenditureStatus>('Pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const totalBudget = expenditures.reduce((acc, item) => acc + item.cost, 0);
  const purchasedBudget = expenditures
    .filter(item => item.status === 'Purchased')
    .reduce((acc, item) => acc + item.cost, 0);
  const pendingBudget = totalBudget - purchasedBudget;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || typeof cost !== 'number' || cost <= 0) return;

    onAddExpenditure({
      item_name: itemName.trim(),
      cost,
      category,
      needed_by: neededBy,
      status
    });

    setItemName('');
    setCost('');
    setCategory('Equipment');
    setStatus('Pending');
    setIsAdding(false);
  };

  const filteredItems = expenditures.filter(item => {
    return categoryFilter === 'All' || item.category === categoryFilter;
  });

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] border border-[#222b3d] rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Top Header */}
      <div className="p-5 border-b border-[#222b3d] bg-gradient-to-r from-[#121620] via-[#161b26] to-[#121620] flex flex-wrap justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c79016]/20 border border-[#c79016]/40 flex items-center justify-center text-[#f5c358] shadow-sm">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-white font-sans uppercase">
                STUDIO BUDGET & PRODUCTION LEDGER
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181e2b] border border-[#222b3d] text-[#f5c358]">
                ₹{totalBudget.toLocaleString('en-IN')} TOTAL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Equipment procurement, studio acoustic rentals, hosting subscriptions, and guest hospitality
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 text-xs font-semibold bg-[#c79016] hover:bg-[#d89e1a] text-black px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? 'CANCEL' : 'ADD EXPENSE ITEM'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#121620] border border-[#222b3d] p-4 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Total Projected Budget</span>
            <span className="text-xl font-bold text-white block mt-1">₹{totalBudget.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">{expenditures.length} Total line items</span>
          </div>

          <div className="bg-[#121620] border border-[#222b3d] p-4 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-emerald-400 block font-semibold">Purchased / Procured</span>
            <span className="text-xl font-bold text-emerald-400 block mt-1">₹{purchasedBudget.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Active gear in studio</span>
          </div>

          <div className="bg-[#121620] border border-[#222b3d] p-4 rounded-2xl">
            <span className="text-[10px] font-mono uppercase text-[#fdba74] block font-semibold">Pending Allocation</span>
            <span className="text-xl font-bold text-[#fdba74] block mt-1">₹{pendingBudget.toLocaleString('en-IN')}</span>
            <span className="text-[10px] text-slate-500 mt-1 block">Awaiting school approval</span>
          </div>
        </div>

        {/* Add Form Modal/Slide */}
        <AnimatePresence>
          {isAdding && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="bg-[#121620] border border-[#222b3d] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shadow-xl"
            >
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block">Item Description</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Shure SM7B Cardioid Dynamic Microphone"
                  className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Estimated Cost (₹)</label>
                <input
                  type="number"
                  required
                  value={cost}
                  onChange={(e) => setCost(e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="25000"
                  className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#3e6688]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenditureCategory)}
                  className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Required By Date</label>
                <input
                  type="date"
                  required
                  value={neededBy}
                  onChange={(e) => setNeededBy(e.target.value)}
                  className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">Procurement Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ExpenditureStatus)}
                  className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Pledged">Pledged / Approved</option>
                  <option value="Purchased">Purchased & Received</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-2 flex items-end justify-end">
                <button
                  type="submit"
                  className="bg-[#3e6688] hover:bg-[#4d7ca6] text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  SAVE BUDGET ITEM
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Expenses List */}
        <div className="bg-[#121620] border border-[#222b3d] rounded-2xl overflow-hidden shadow-md">
          <div className="p-4 border-b border-[#222b3d] bg-[#161b26] flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-sans">
              EXPENDITURE LINE ITEMS ({filteredItems.length})
            </h3>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#0b0e14] border border-[#222b3d] rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="text-slate-400 bg-[#0e121a] border-b border-[#222b3d] text-[10px] font-mono uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 font-normal">Item Detail</th>
                  <th className="p-3.5 font-normal">Category</th>
                  <th className="p-3.5 font-normal">Needed By</th>
                  <th className="p-3.5 font-normal">Cost</th>
                  <th className="p-3.5 font-normal">Status</th>
                  <th className="p-3.5 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222b3d]/60">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#181e2b]/40 transition-colors">
                    <td className="p-3.5">
                      <span className="text-white font-medium block">{item.item_name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{item.id}</span>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <span className="bg-[#0b0e14] border border-[#222b3d] px-2.5 py-1 rounded-lg text-xs font-mono">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{item.needed_by}</td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      ₹{item.cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={item.status}
                        onChange={(e) => onUpdateStatus(item.id, e.target.value as ExpenditureStatus)}
                        className={`text-xs font-mono rounded-lg px-2.5 py-1 border outline-none cursor-pointer ${
                          item.status === 'Purchased'
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                            : item.status === 'Pledged'
                            ? 'bg-[#c79016]/20 text-[#f5c358] border-[#c79016]/40'
                            : 'bg-[#181e2b] text-slate-300 border-[#222b3d]'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Pledged">Pledged</option>
                        <option value="Purchased">Purchased</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.item_name}"?`)) {
                            onDeleteExpenditure(item.id);
                          }
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 transition-colors cursor-pointer"
                        title="Delete Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-sans text-xs">
                      No expense items in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

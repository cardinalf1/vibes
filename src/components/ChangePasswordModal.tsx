import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Lock, CheckCircle2, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from './AuthGate';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdatePassword: (newPassword: string) => Promise<void>;
}

export function ChangePasswordModal({ isOpen, onClose, onUpdatePassword }: ChangePasswordModalProps) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await onUpdatePassword(newPassword.trim());
      setSuccessMsg('Your password has been successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#121620] border border-[#222b3d] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden font-sans"
      >
        <div className="p-5 border-b border-[#222b3d] bg-[#161b26] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#c79016]/20 border border-[#c79016]/40 flex items-center justify-center text-[#f5c358]">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                Change Password
              </h3>
              <p className="text-xs text-slate-400">
                Update credentials for <strong className="text-white">@{user?.username || user?.user_metadata?.username}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">New Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-9 pr-10 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#3e6688]"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-[#0b0e14] border border-[#222b3d] rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#3e6688]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#222b3d]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#181e2b] hover:bg-[#20283a] text-slate-300 border border-[#222b3d] rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#3e6688] hover:bg-[#4d7ca6] text-white font-semibold rounded-xl text-xs shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update My Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

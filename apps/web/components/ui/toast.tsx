import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose?: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  if (!message) return null;

  return (
    <div 
      onClick={onClose}
      className={`fixed bottom-6 right-6 z-50 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 border cursor-pointer ${
        type === 'error' ? 'bg-red-950 border-red-800' : 'bg-slate-900 border-slate-700'
      }`}
    >
      {type === 'error' ? (
        <AlertTriangle size={16} className="text-red-400 shrink-0" />
      ) : (
        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}

'use client';

import React from 'react';
import { X, Activity, FileText, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ActivityEvent } from '@/context/orders-context';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityEvent[];
}

export function ActivitiesModal({ isOpen, onClose, activities }: Props) {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'check':
        return <CheckCircle2 size={18} className="text-emerald-600" />;
      case 'alert':
        return <AlertTriangle size={18} className="text-red-600" />;
      case 'wrench':
        return <Wrench size={18} className="text-blue-900" />;
      default:
        return <FileText size={18} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-lg shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-blue-900/10 text-blue-900 flex items-center justify-center">
              <Activity size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Histórico de Atividades</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Log recente de atualizações e chamados
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {activities.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">Nenhuma atividade registrada.</p>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-md border border-slate-100 bg-slate-50/50 flex items-center gap-3.5"
              >
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {getIcon(act.iconType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 break-words">{act.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">{act.time}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

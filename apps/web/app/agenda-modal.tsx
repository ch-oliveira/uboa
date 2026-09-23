'use client';

import React from 'react';
import { X, Clock, MapPin, CheckCircle2, User, Wrench, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type AgendaEvent } from '@/context/orders-context';

interface Props {
  event: AgendaEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete: (id: string) => void;
}

export function AgendaModal({ event, isOpen, onClose, onToggleComplete }: Props) {
  if (!isOpen || !event) return null;

  const getIcon = () => {
    switch (event.type) {
      case 'eletrica':
        return <Zap size={22} className="text-amber-500" />;
      case 'hidraulica':
        return <Wrench size={22} className="text-[#1D6FEB]" />;
      default:
        return <CheckCircle2 size={22} className="text-emerald-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{event.title}</h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                event.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {event.completed ? 'Concluído' : 'Agendado para hoje'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <Clock size={18} className="text-slate-500" />
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Horário</p>
              <p className="text-sm font-bold text-slate-800">{event.time} — 23 de Setembro</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <MapPin size={18} className="text-slate-500" />
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Local</p>
              <p className="text-sm font-bold text-slate-800">{event.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <User size={18} className="text-slate-500" />
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Equipe Técnica Designada</p>
              <p className="text-sm font-bold text-slate-800">Equipe de Manutenção Predial #02</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <Button 
            variant={event.completed ? 'outline' : 'default'}
            className={!event.completed ? 'bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg' : 'rounded-lg'}
            onClick={() => {
              onToggleComplete(event.id);
              onClose();
            }}
          >
            <CheckCircle2 size={16} className="mr-2" />
            {event.completed ? 'Reabrir visita' : 'Marcar como concluída'}
          </Button>
          <Button variant="ghost" onClick={onClose} className="rounded-lg">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { PREDIOS, TECNICOS, type Prioridade } from './data';

export interface FilterState {
  prioridade: Prioridade | 'TODAS';
  predio: string;
  tecnico: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function KanbanFilterPopover({ isOpen, onClose, filters, onChange, onReset }: Props) {
  if (!isOpen) return null;

  return (
    <div 
      className="absolute right-0 top-12 z-30 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h4 className="font-bold text-slate-800 text-sm">Filtros do Painel</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            title="Redefinir filtros"
            className="text-xs text-slate-400 hover:text-[#1D6FEB] flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw size={12} />
            Limpar
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded p-1 hover:bg-slate-100"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Filter by Priority */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Prioridade
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['TODAS', 'URGENTE', 'ALTA', 'MEDIA', 'BAIXA'] as const).map((p) => {
            const isSelected = filters.prioridade === p;
            return (
              <button
                key={p}
                onClick={() => onChange({ ...filters, prioridade: p })}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-[#1D6FEB] text-white border-[#1D6FEB]'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p === 'TODAS' ? 'Todas' : p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter by Building */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Unidade / Prédio
        </label>
        <select
          value={filters.predio}
          onChange={(e) => onChange({ ...filters, predio: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1D6FEB]"
        >
          <option value="TODOS">Todas as unidades</option>
          {PREDIOS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Filter by Technician */}
      <div>
        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          Técnico Responsável
        </label>
        <select
          value={filters.tecnico}
          onChange={(e) => onChange({ ...filters, tecnico: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1D6FEB]"
        >
          <option value="TODOS">Todos os técnicos</option>
          <option value="SEM_TECNICO">Sem técnico atribuído</option>
          <option value="COM_TECNICO">Com técnico atribuído</option>
          {TECNICOS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

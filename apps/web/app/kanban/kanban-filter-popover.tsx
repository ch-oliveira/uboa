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
      className="absolute right-0 top-12 z-30 w-80 bg-card rounded-2xl shadow-xl border border-border p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h4 className="font-bold text-foreground text-sm">Filtros do Painel</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            title="Redefinir filtros"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-medium transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            Limpar
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded p-1 hover:bg-muted cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Filter by Priority */}
      <div>
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Prioridade
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['TODAS', 'URGENTE', 'ALTA', 'MEDIA', 'BAIXA'] as const).map((p) => {
            const isSelected = filters.prioridade === p;
            return (
              <button
                key={p}
                onClick={() => onChange({ ...filters, prioridade: p })}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
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
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
          Unidade / Prédio
        </label>
        <select
          value={filters.predio}
          onChange={(e) => onChange({ ...filters, predio: e.target.value })}
          className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="TODOS">Todas as unidades</option>
          {PREDIOS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Filter by Technician */}
      <div>
        <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
          Técnico Responsável
        </label>
        <select
          value={filters.tecnico}
          onChange={(e) => onChange({ ...filters, tecnico: e.target.value })}
          className="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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

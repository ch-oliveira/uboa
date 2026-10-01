import type { Prioridade, StatusOS } from '@/app/kanban/data';

export interface PriorityBadgeInfo {
  label: string;
  style: string;
  dotColor: string;
  pulse?: boolean;
}

export interface StatusBadgeInfo {
  label: string;
  style: string;
  dotColor: string;
  pulse?: boolean;
}

export function getPriorityBadgeInfo(p: Prioridade | string): PriorityBadgeInfo {
  switch (p) {
    case 'URGENTE':
      return {
        label: 'Urgente',
        style: 'bg-rose-50/90 text-rose-700 border-rose-200/80 shadow-xs',
        dotColor: 'bg-rose-500',
        pulse: true,
      };
    case 'ALTA':
      return {
        label: 'Alta',
        style: 'bg-amber-50/90 text-amber-800 border-amber-200/80 shadow-xs',
        dotColor: 'bg-amber-500',
        pulse: false,
      };
    case 'MEDIA':
      return {
        label: 'Média',
        style: 'bg-slate-100 text-slate-700 border-slate-200/80 shadow-xs',
        dotColor: 'bg-slate-500',
        pulse: false,
      };
    case 'BAIXA':
    default:
      return {
        label: 'Baixa',
        style: 'bg-slate-50 text-slate-600 border-slate-200 shadow-xs',
        dotColor: 'bg-slate-400',
        pulse: false,
      };
  }
}

export function getPriorityBadge(p: Prioridade | string): string {
  return getPriorityBadgeInfo(p).style;
}

export function getStatusBadge(s: StatusOS | string): StatusBadgeInfo {
  switch (s) {
    case 'EM_EXECUCAO':
      return { 
        label: 'Em execução', 
        style: 'bg-blue-50/70 text-blue-900 border-blue-900/20 shadow-xs',
        dotColor: 'bg-blue-800',
        pulse: true,
      };
    case 'TRIAGEM':
      return { 
        label: 'Em triagem', 
        style: 'bg-amber-50/90 text-amber-800 border-amber-200/80 shadow-xs',
        dotColor: 'bg-amber-500',
        pulse: false,
      };
    case 'AGENDADO':
      return { 
        label: 'Agendado', 
        style: 'bg-slate-100/90 text-slate-700 border-slate-200 shadow-xs',
        dotColor: 'bg-slate-400',
        pulse: false,
      };
    case 'AGUARDANDO':
      return { 
        label: 'Aguardando', 
        style: 'bg-purple-50/90 text-purple-700 border-purple-200/80 shadow-xs',
        dotColor: 'bg-purple-500',
        pulse: false,
      };
    case 'CONCLUIDO':
      return { 
        label: 'Concluído', 
        style: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 shadow-xs',
        dotColor: 'bg-emerald-500',
        pulse: false,
      };
    default:
      return { 
        label: s, 
        style: 'bg-slate-50 text-slate-600 border-slate-200 shadow-xs',
        dotColor: 'bg-slate-400',
        pulse: false,
      };
  }
}

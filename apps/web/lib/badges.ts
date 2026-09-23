import type { Prioridade, StatusOS } from '@/app/kanban/data';

export interface StatusBadgeInfo {
  label: string;
  style: string;
}

export function getPriorityBadge(p: Prioridade | string): string {
  switch (p) {
    case 'URGENTE':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'ALTA':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'MEDIA':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'BAIXA':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

export function getStatusBadge(s: StatusOS | string): StatusBadgeInfo {
  switch (s) {
    case 'EM_EXECUCAO':
      return { label: 'Em execução', style: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'TRIAGEM':
      return { label: 'Em triagem', style: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'AGENDADO':
      return { label: 'Agendado', style: 'bg-slate-100 text-slate-700 border-slate-200' };
    case 'AGUARDANDO':
      return { label: 'Aguardando', style: 'bg-purple-50 text-purple-700 border-purple-200' };
    case 'CONCLUIDO':
      return { label: 'Concluído', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    default:
      return { label: s, style: 'bg-slate-100 text-slate-600 border-slate-200' };
  }
}

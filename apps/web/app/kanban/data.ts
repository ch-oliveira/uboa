// Shared types and data for the Kanban board
export type Prioridade = 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAIXA';
export type StatusOS = 'TRIAGEM' | 'AGENDADO' | 'EM_EXECUCAO' | 'AGUARDANDO' | 'CONCLUIDO';

export interface OrdemServico {
  id: string;
  titulo: string;
  predio: string;
  prioridade: Prioridade;
  status: StatusOS;
  dataAbertura: string;
  solicitante: string;
  tecnico?: string;
  descricao?: string;
  historico?: { data: string; descricao: string; autor: string }[];
}

export interface KanbanColumn {
  id: StatusOS;
  title: string;
  color: string;
  dotColor: string;
}

export const COLUMNS: KanbanColumn[] = [
  { id: 'TRIAGEM',      title: 'Triagem',         color: 'text-amber-700', dotColor: 'bg-amber-500' },
  { id: 'AGENDADO',     title: 'Agendado',        color: 'text-slate-700', dotColor: 'bg-slate-400' },
  { id: 'EM_EXECUCAO',  title: 'Em Execução',     color: 'text-blue-700',  dotColor: 'bg-[#1D6FEB]' },
  { id: 'AGUARDANDO',   title: 'Aguardando Conf.', color: 'text-purple-700', dotColor: 'bg-purple-500' },
  { id: 'CONCLUIDO',    title: 'Concluído',       color: 'text-emerald-700', dotColor: 'bg-emerald-500' },
];

export const PREDIOS = [
  'EMEF Paulo Freire',
  'EMEI Sementinha',
  'UBS Vila Nova',
  'UBS Central',
  'UBS Vila Esperança',
  'Prefeitura – Ala Sul',
  'Praça da Matriz',
  'Biblioteca Municipal',
  'Secretaria de Obras',
];

export const TECNICOS = [
  'Carlos T.',
  'Roberto F.',
  'Mariana Alves',
  'Lucas Duarte',
];


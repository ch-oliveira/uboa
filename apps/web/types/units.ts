export type TipoUnidade = 'ESCOLA' | 'UBS' | 'HOSPITAL' | 'ADMINISTRATIVO' | 'PRACA';

export interface UnidadeItem {
  id: string;
  nome: string;
  tipo: TipoUnidade;
  setor?: string;
  porte?: string;
  capacidade?: number;
  endereco: string;
  latitude?: number;
  longitude?: number;
  ativo?: boolean;
  motivoDesativacao?: string;
  gestor: string;
  telefone: string;
  email?: string;
  openTicketsCount?: number;
  urgentTicketsCount?: number;
  completedTicketsCount?: number;
  totalTicketsCount?: number;
  healthStatus?: 'CRITICAL' | 'ATTENTION' | 'REGULAR';
}

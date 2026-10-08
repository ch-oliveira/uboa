export type Role = 'ADMIN' | 'GESTOR' | 'TECNICO' | 'SOLICITANTE';

export type StatusOS =
  | 'RECEBIDO'
  | 'EM_TRIAGEM'
  | 'AGENDADO'
  | 'AGUARDANDO'
  | 'EM_EXECUCAO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';

export type TipoPredio = 'ESCOLA' | 'HOSPITAL' | 'PRACA' | 'ADMINISTRATIVO' | 'UBS';

export const MOTIVOS_PAUSA_PADRAO = [
  { id: 'FALTA_PECA', label: 'Falta de Peça / Material' },
  { id: 'LOCAL_TRANCADO', label: 'Local Trancado / Sem Acesso' },
  { id: 'CONDICOES_CLIMATICAS', label: 'Condições Climáticas Adversas' },
  { id: 'FIM_EXPEDIENTE', label: 'Fim do Turno / Expediente' },
  { id: 'AGUARDANDO_TERCEIRO', label: 'Aguardando Terceiros / Concessionária' },
  { id: 'OUTRO', label: 'Outro Motivo Justificado' },
] as const;

export type MotivoPausaId = (typeof MOTIVOS_PAUSA_PADRAO)[number]['id'];

export interface UsuarioSession {
  id: string;
  nome: string;
  email: string;
  role: Role;
  especialidade?: string;
  telefone?: string;
}

export interface PredioResumo {
  id: string;
  nome: string;
  tipo: TipoPredio;
  endereco: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface OrdemServicoItem {
  id: string;
  codigo: string;
  titulo: string;
  descricao: string;
  categoria?: string;
  prioridade: Prioridade;
  status: StatusOS;
  predio_id: string;
  predio: PredioResumo;
  tecnico_atribuido_id?: string | null;
  fotos: string[];
  fotos_conclusao: string[];
  motivo_pausa?: string | null;
  data_limite_sla?: string | null;
  iniciado_em?: string | null;
  concluido_em?: string | null;
  pausado_em?: string | null;
  tempo_pausa_minutos: number;
  sla_violado: boolean;
  criado_em: string;
  atualizado: string;
}

export interface OportunidadeProximidade {
  osId: string;
  codigo: string;
  titulo: string;
  categoria: string;
  prioridade: Prioridade;
  predioNome: string;
  distanciaKm: number;
  compatibilidade: 'EXATA' | 'GERAL';
}

export interface SyncMutation {
  id: string;
  tipo: 'INICIAR_OS' | 'PAUSAR_OS' | 'RETOMAR_OS' | 'CONCLUIR_OS' | 'ANEXAR_FOTO';
  osId: string;
  payload: string; // JSON serializado
  criadoEm: string;
  tentativas: number;
  status: 'PENDENTE' | 'PROCESSANDO' | 'FALHA';
}

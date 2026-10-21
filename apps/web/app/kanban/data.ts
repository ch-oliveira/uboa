export type Prioridade = 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAIXA';
export type StatusOS = 'TRIAGEM' | 'AGENDADO' | 'EM_EXECUCAO' | 'AGUARDANDO' | 'CONCLUIDO' | 'CANCELADO';

export interface HistoricoItem {
  data: string;
  descricao: string;
  autor: string;
  tipo?: 'SISTEMA' | 'COMENTARIO' | 'STATUS' | 'EXCECAO';
}

export interface ItemConsumoOS {
  id: string;
  materialId?: string;
  descricao: string;
  quantidade: number;
  unidadeMedida: string;
  precoUnitario: number;
  precoTotal: number;
  criadoEm?: string;
}

export interface MaterialItem {
  id: string;
  codigo?: string;
  nome: string;
  categoria?: string;
  unidadeMedida: string;
  precoUnitario: number;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export interface ContratoItem {
  id: string;
  numeroContrato: string;
  numeroEmpenho: string;
  empresaContratada: string;
  cnpjContratada?: string;
  objeto?: string;
  categoriaPadrao: string;
  valorTotalEmpenhado: number;
  valorTotalMedido: number;
  saldoRestante: number;
  percentualExecutado: number;
  vigenciaInicio?: string;
  vigenciaFim?: string;
  ativo: boolean;
  ordensCount?: number;
  prefeituraId?: string;
}

export interface OrdemServico {
  id: string;
  titulo: string;
  predio: string;
  prioridade: Prioridade;
  status: StatusOS;
  dataAbertura: string;
  openedAt?: string;
  iniciadoEm?: string;
  concluidoEm?: string;
  dataLimiteSla?: string;
  solicitante: string;
  tecnico?: string;
  descricao?: string;
  prazoEstimado?: string;
  localizacao?: string;
  categoria?: string;
  fotos?: string[];
  fotosConclusao?: string[];
  motivoPausa?: string;
  motivoCancelamento?: string;
  ordemVinculadaId?: string;
  slaViolado?: boolean;
  motivoViolacaoSla?: string;
  tempoPausaMinutos?: number;
  pausadoEm?: string;
  historicoPausas?: any[];
  liquidRepairTimeMinutes?: number;
  impedimento?: {
    ativo: boolean;
    motivo: string;
    data: string;
  };
  historico?: HistoricoItem[];
  custoMateriais?: number;
  custoMaoDeObra?: number;
  custoTotal?: number;
  contratoId?: string;
  empresaTerceirizada?: string;
  numeroEmpenho?: string;
  materiaisConsumidos?: ItemConsumoOS[];
}

export interface KanbanColumn {
  id: StatusOS;
  title: string;
  shortTitle: string;
  subtitle?: string;
  color: string;
  dotColor: string;
}

export const COLUMNS: KanbanColumn[] = [
  { id: 'TRIAGEM',      title: 'Triagem',                shortTitle: 'Triagem',      subtitle: 'Avaliar e encaminhar',    color: 'text-amber-700', dotColor: 'bg-amber-500' },
  { id: 'AGENDADO',     title: 'Agendado',               shortTitle: 'Agendado',     subtitle: 'Intervenções planejadas', color: 'text-slate-700', dotColor: 'bg-slate-500' },
  { id: 'EM_EXECUCAO',  title: 'Em execução',            shortTitle: 'Em Execução',  subtitle: 'Equipes em campo',        color: 'text-blue-900',  dotColor: 'bg-blue-800' },
  { id: 'AGUARDANDO',   title: 'Aguardando validação',   shortTitle: 'Validação',    subtitle: 'Validar com a unidade',   color: 'text-purple-700', dotColor: 'bg-purple-600' },
  { id: 'CONCLUIDO',    title: 'Concluído',              shortTitle: 'Concluído',    subtitle: 'Serviços finalizados',    color: 'text-emerald-700', dotColor: 'bg-emerald-500' },
];

export const BOARD_COLUMNS = COLUMNS.filter((c) => c.id !== 'CONCLUIDO');

export const PREDIOS = [
  'EMEF Paulo Freire',
  'EMEI Sementinha',
  'EMEF Santos Dumont',
  'UBS Vila Nova',
  'UBS Central',
  'UBS Vila Esperança',
  'Prefeitura – Ala Sul',
  'Praça da Matriz',
  'Biblioteca Municipal',
  'Secretaria de Obras',
];

export const TECNICOS = [
  'Carlos Silva',
  'Roberto Santos',
  'Marcos Oliveira',
  'Lucas Pereira',
];


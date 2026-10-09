export type TipoManifestacao = 'RECLAMACAO' | 'ELOGIO' | 'SUGESTAO' | 'OUTRO';

export type StatusManifestacao =
  | 'RECEBIDA'
  | 'EM_ANALISE'
  | 'RESPONDIDA'
  | 'ENCAMINHADA'
  | 'ARQUIVADA'
  | 'CONVERTIDA_EM_OS';

export interface ManifestacaoItem {
  id: string;
  protocolo: string;
  tipo: TipoManifestacao;
  categoria: string;
  descricao: string;
  predioId?: string | null;
  predioNome: string;
  predioTipo?: string | null;
  predioEndereco?: string | null;
  localReferencia?: string | null;
  bairro?: string | null;
  anonimo: boolean;
  manifestanteNome?: string | null;
  manifestanteEmail?: string | null;
  manifestanteTelefone?: string | null;
  status: StatusManifestacao;
  respostaOficial?: string | null;
  respondidoEm?: string | null;
  respondidoPorNome?: string | null;
  motivoArquivamento?: string | null;
  ordemServicoId?: string | null;
  ordemServicoCodigo?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PublicManifestacaoTrack {
  protocolo: string;
  tipo: TipoManifestacao;
  categoria: string;
  descricao: string;
  localReferencia?: string | null;
  bairro?: string | null;
  predio?: {
    nome: string;
    tipo: string;
    endereco: string;
  } | null;
  status: StatusManifestacao;
  respostaOficial?: string | null;
  respondidoEm?: string | null;
  ordemServicoCodigo?: string | null;
  criadoEm: string;
}

export interface ManifestacoesMeta {
  totalCount: number;
  recebidasCount: number;
  respondidasCount: number;
  arquivadasCount: number;
  convertidasCount: number;
  pendentesCount: number;
}

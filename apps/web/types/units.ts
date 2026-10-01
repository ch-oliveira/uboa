export type TipoUnidade = 'ESCOLA' | 'UBS' | 'HOSPITAL' | 'ADMINISTRATIVO' | 'PRACA';

export interface UnidadeItem {
  id: string;
  nome: string;
  tipo: TipoUnidade;
  endereco: string;
  gestor: string;
  telefone: string;
  email?: string;
}

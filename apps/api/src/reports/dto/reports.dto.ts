import { IsOptional, IsString } from 'class-validator';

export class ReportsFilterDto {
  @IsString()
  @IsOptional()
  period?: 'MES_ATUAL' | 'ULTIMOS_30' | 'TRIMESTRE' | 'ANO_2026' | 'ALL';

  @IsString()
  @IsOptional()
  predioId?: string;

  @IsString()
  @IsOptional()
  setor?: string;
}

export interface ReportsSummaryResponse {
  periodo: string;
  mttrHoras: number; // Média líquida sobre CONCLUIDO descontando pausas
  totalOrdens: number;
  totalConcluidas: number;
  totalAbertas: number;
  totalPausadas: number;
  tempoTotalPausadoHoras: number;
  totalVistorias: number;
  totalVistoriasConcluidas: number;
  indicePreventivaPercent: number; // % de preventivas vs total
  metaPreventivaPercent: number; // 80% meta padrão municipal
  conformidadeFiscal: 'CONFORME' | 'ATENCAO' | 'CRITICO';
  mensagemConformidade: string;
  slaCumpridoPercent: number;
  slaVioladasCount: number;
  distribuicaoPorPrioridade: {
    URGENTE: number;
    ALTA: number;
    MEDIA: number;
    BAIXA: number;
  };
  distribuicaoPorStatus: Record<string, number>;
  distribuicaoPorSetor: Array<{
    setor: string;
    totalOrdens: number;
    concluidas: number;
    preventivas: number;
    indicePreventiva: number;
    conformidade: 'CONFORME' | 'ATENCAO' | 'CRITICO';
  }>;
}

export interface AuditCsvExportResponse {
  filename: string;
  csvContent: string;
  totalRegistros: number;
  geradoEm: string;
  responsavel: string;
}

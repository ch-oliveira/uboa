import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusOS, Role, AuditAction } from '@repo/database';
import {
  ReportsFilterDto,
  ReportsSummaryResponse,
  AuditCsvExportResponse,
} from './dto/reports.dto.js';
import { ApiResponse } from '../common/interfaces/api-response.interface.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  private validateAdminAccess(currentUser?: any) {
    if (!currentUser || currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException(
        'Acesso restrito: apenas Administradores Municipais (ADMIN) possuem permissão para acessar relatórios fiscais, auditoria e exportação de dados do Tribunal de Contas.',
      );
    }
  }

  private getPeriodDateFilter(period?: string): { gte?: Date } {
    const now = new Date();
    if (period === 'MES_ATUAL') {
      return { gte: new Date(now.getFullYear(), now.getMonth(), 1) };
    }
    if (period === 'ULTIMOS_30') {
      return { gte: new Date(now.getTime() - 30 * 24 * 3600 * 1000) };
    }
    if (period === 'TRIMESTRE') {
      return { gte: new Date(now.getTime() - 90 * 24 * 3600 * 1000) };
    }
    if (period === 'ANO_2026') {
      return { gte: new Date(2026, 0, 1) };
    }
    return {};
  }

  async getSummary(
    filter?: ReportsFilterDto,
    currentUser?: any,
  ): Promise<ApiResponse<ReportsSummaryResponse>> {
    this.validateAdminAccess(currentUser);

    const dateFilter = this.getPeriodDateFilter(filter?.period);
    const whereOS: any = {};
    const whereVistoria: any = {};

    if (dateFilter.gte) {
      whereOS.criado_em = dateFilter;
      whereVistoria.criado_em = dateFilter;
    }

    if (filter?.predioId) {
      whereOS.predio_id = filter.predioId;
      whereVistoria.predio_id = filter.predioId;
    }

    // 1. Carrega configurações do sistema (para meta de preventiva e MTTR)
    const config = await this.prisma.configuracaoSistema.findFirst().catch(() => null);
    const metaPreventiva = config?.preventiva_goal ?? 80;

    // 2. Busca Ordens de Serviço do período
    const ordens = await this.prisma.ordemServico.findMany({
      where: whereOS,
      include: { predio: true },
    });

    // 3. Busca Vistorias Preventivas do período
    const vistorias = await this.prisma.agendaVistoria.findMany({
      where: whereVistoria,
      include: { predio: true },
    });

    // 4. Cálculo do MTTR Líquido (Exclusivamente sobre ordens CONCLUIDAS, descontando pausas)
    const concluidas = ordens.filter((o) => o.status === StatusOS.CONCLUIDO && o.concluido_em);
    let somaMinutosLiquidos = 0;
    let somaMinutosPausados = 0;

    for (const c of concluidas) {
      const grossMinutes = Math.max(
        0,
        Math.floor((new Date(c.concluido_em!).getTime() - new Date(c.criado_em).getTime()) / 60000),
      );
      const pauseMin = c.tempo_pausa_minutos || 0;
      const netMinutes = Math.max(0, grossMinutes - pauseMin);
      somaMinutosLiquidos += netMinutes;
      somaMinutosPausados += pauseMin;
    }

    // Soma pausas de todas as ordens (inclusive em andamento) para relatório de auditoria
    for (const o of ordens) {
      if (o.status !== StatusOS.CONCLUIDO) {
        somaMinutosPausados += o.tempo_pausa_minutos || 0;
      }
    }

    const mttrHoras =
      concluidas.length > 0
        ? Math.round((somaMinutosLiquidos / concluidas.length / 60) * 10) / 10
        : 0;

    // 5. Índice de Manutenção Preventiva vs. Corretiva
    const totalOrdens = ordens.length;
    const totalVistorias = vistorias.length;
    const totalAcoes = totalOrdens + totalVistorias;
    const indicePreventivaPercent =
      totalAcoes > 0
        ? Math.round((totalVistorias / totalAcoes) * 1000) / 10
        : 100;

    // Classificação de Conformidade Fiscal (Meta 80%, Alerta 70%)
    let conformidadeFiscal: 'CONFORME' | 'ATENCAO' | 'CRITICO' = 'CONFORME';
    let mensagemConformidade = 'Meta Municipal Atingida. Gestão predial em conformidade com as diretrizes do Tribunal de Contas.';

    if (indicePreventivaPercent < 70) {
      conformidadeFiscal = 'CRITICO';
      mensagemConformidade = 'Alerta Crítico: Índice preventivo abaixo de 70%. Risco de apontamento fiscal e auditoria especial do Tribunal de Contas.';
    } else if (indicePreventivaPercent < metaPreventiva) {
      conformidadeFiscal = 'ATENCAO';
      mensagemConformidade = `Alerta de Atenção: Índice preventivo (${indicePreventivaPercent}%) abaixo da meta de ${metaPreventiva}%. Risco de passivo patrimonial.`;
    }

    // 6. Violação de SLA
    const now = new Date();
    let slaVioladasCount = 0;
    let concluidasNoPrazo = 0;

    for (const o of ordens) {
      const isConcluded = o.status === StatusOS.CONCLUIDO;
      const isCancelled = o.status === StatusOS.CANCELADO;
      const isExpiredOpen =
        !isConcluded &&
        !isCancelled &&
        o.data_limite_sla &&
        new Date(o.data_limite_sla).getTime() < now.getTime();

      if (o.sla_violado || isExpiredOpen) {
        slaVioladasCount++;
      }

      if (isConcluded && !o.sla_violado) {
        concluidasNoPrazo++;
      }
    }

    const slaCumpridoPercent =
      concluidas.length > 0
        ? Math.round((concluidasNoPrazo / concluidas.length) * 1000) / 10
        : 100;

    // 7. Distribuições
    const distribuicaoPorPrioridade = {
      URGENTE: ordens.filter((o) => o.prioridade === 'URGENTE').length,
      ALTA: ordens.filter((o) => o.prioridade === 'ALTA').length,
      MEDIA: ordens.filter((o) => o.prioridade === 'MEDIA').length,
      BAIXA: ordens.filter((o) => o.prioridade === 'BAIXA').length,
    };

    const distribuicaoPorStatus: Record<string, number> = {};
    for (const o of ordens) {
      distribuicaoPorStatus[o.status] = (distribuicaoPorStatus[o.status] || 0) + 1;
    }

    // 8. Agrupamento por Setor
    const setorMap = new Map<
      string,
      { total: number; concluidas: number; preventivas: number }
    >();

    for (const o of ordens) {
      const s = o.predio?.setor || 'Administração Geral';
      const cur = setorMap.get(s) || { total: 0, concluidas: 0, preventivas: 0 };
      cur.total++;
      if (o.status === StatusOS.CONCLUIDO) cur.concluidas++;
      setorMap.set(s, cur);
    }

    for (const v of vistorias) {
      const s = v.predio?.setor || 'Administração Geral';
      const cur = setorMap.get(s) || { total: 0, concluidas: 0, preventivas: 0 };
      cur.preventivas++;
      setorMap.set(s, cur);
    }

    const distribuicaoPorSetor = Array.from(setorMap.entries()).map(
      ([setor, counts]) => {
        const total = counts.total + counts.preventivas;
        const ind = total > 0 ? Math.round((counts.preventivas / total) * 1000) / 10 : 100;
        let conf: 'CONFORME' | 'ATENCAO' | 'CRITICO' = 'CONFORME';
        if (ind < 70) conf = 'CRITICO';
        else if (ind < metaPreventiva) conf = 'ATENCAO';

        return {
          setor,
          totalOrdens: counts.total,
          concluidas: counts.concluidas,
          preventivas: counts.preventivas,
          indicePreventiva: ind,
          conformidade: conf,
        };
      },
    );

    return {
      success: true,
      data: {
        periodo: filter?.period || 'MES_ATUAL',
        mttrHoras,
        totalOrdens,
        totalConcluidas: concluidas.length,
        totalAbertas: ordens.filter(
          (o) => o.status !== StatusOS.CONCLUIDO && o.status !== StatusOS.CANCELADO,
        ).length,
        totalPausadas: ordens.filter((o) => o.status === StatusOS.AGUARDANDO).length,
        tempoTotalPausadoHoras: Math.round((somaMinutosPausados / 60) * 10) / 10,
        totalVistorias,
        totalVistoriasConcluidas: vistorias.filter((v) => v.concluido).length,
        indicePreventivaPercent,
        metaPreventivaPercent: metaPreventiva,
        conformidadeFiscal,
        mensagemConformidade,
        slaCumpridoPercent,
        slaVioladasCount,
        distribuicaoPorPrioridade,
        distribuicaoPorStatus,
        distribuicaoPorSetor,
      },
      message: 'Métricas e resumo de auditoria gerados com sucesso.',
    };
  }

  async exportAuditCsv(
    filter?: ReportsFilterDto,
    currentUser?: any,
  ): Promise<ApiResponse<AuditCsvExportResponse>> {
    this.validateAdminAccess(currentUser);

    const dateFilter = this.getPeriodDateFilter(filter?.period);
    const whereOS: any = {};
    if (dateFilter.gte) whereOS.criado_em = dateFilter;
    if (filter?.predioId) whereOS.predio_id = filter.predioId;

    const ordens = await this.prisma.ordemServico.findMany({
      where: whereOS,
      include: { predio: true, solicitante: true, tecnico: true },
      orderBy: { criado_em: 'desc' },
    });

    const headers = [
      'Código',
      'Título',
      'Prédio',
      'Setor',
      'Prioridade',
      'Status',
      'Técnico Responsável',
      'Data de Abertura',
      'Data de Conclusão',
      'Tempo em Pausa (min)',
      'Tempo Líquido de Reparo (h)',
      'Data Limite SLA',
      'SLA Cumprido',
      'Motivo da Pausa',
      'Motivo de Cancelamento',
      'Motivo de Violação de SLA',
    ];

    const rows = ordens.map((o) => {
      let tempoLiquidoHoras = '';
      if (o.concluido_em) {
        const gross = Math.max(
          0,
          Math.floor((new Date(o.concluido_em).getTime() - new Date(o.criado_em).getTime()) / 60000),
        );
        const netMin = Math.max(0, gross - (o.tempo_pausa_minutos || 0));
        tempoLiquidoHoras = (Math.round((netMin / 60) * 10) / 10).toString().replace('.', ',');
      }

      const isSlaOk =
        o.status === StatusOS.CONCLUIDO
          ? !o.sla_violado
            ? 'SIM'
            : 'NÃO'
          : o.data_limite_sla && new Date(o.data_limite_sla).getTime() < Date.now()
            ? 'NÃO (VENCIDO)'
            : 'EM ANDAMENTO';

      return [
        `"${o.codigo}"`,
        `"${(o.titulo || '').replace(/"/g, '""')}"`,
        `"${(o.predio?.nome || '').replace(/"/g, '""')}"`,
        `"${(o.predio?.setor || 'Administração').replace(/"/g, '""')}"`,
        `"${o.prioridade}"`,
        `"${o.status}"`,
        `"${(o.tecnico?.nome || 'Não atribuído').replace(/"/g, '""')}"`,
        `"${o.criado_em.toISOString()}"`,
        `"${o.concluido_em ? o.concluido_em.toISOString() : ''}"`,
        o.tempo_pausa_minutos || 0,
        `"${tempoLiquidoHoras}"`,
        `"${o.data_limite_sla ? o.data_limite_sla.toISOString() : ''}"`,
        `"${isSlaOk}"`,
        `"${(o.motivo_pausa || '').replace(/"/g, '""')}"`,
        `"${(o.motivo_cancelamento || '').replace(/"/g, '""')}"`,
        `"${(o.motivo_violacao_sla || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const filename = `relatorio-fiscal-tce-${new Date().toISOString().slice(0, 10)}.csv`;

    // Grava registro imutável em AuditoriaLog para rastreabilidade do Tribunal de Contas
    if (currentUser?.id) {
      await this.prisma.auditoriaLog.create({
        data: {
          entidade_afetada: 'RelatorioFiscal',
          entidade_id: filename,
          acao: AuditAction.CREATE,
          usuario_id: currentUser.id,
          dados_novos: {
            tipo: 'EXPORTACAO_CSV_TRIBUNAL_DE_CONTAS',
            totalRegistros: ordens.length,
            periodo: filter?.period || 'MES_ATUAL',
            geradoEm: new Date().toISOString(),
          },
        },
      });
    }

    return {
      success: true,
      data: {
        filename,
        csvContent,
        totalRegistros: ordens.length,
        geradoEm: new Date().toISOString(),
        responsavel: currentUser?.nome || 'Administrador Municipal',
      },
      message: 'Relatório CSV para auditoria gerado com sucesso.',
    };
  }

  async getAuditLogs(currentUser?: any): Promise<ApiResponse<any[]>> {
    this.validateAdminAccess(currentUser);

    const logs = await this.prisma.auditoriaLog.findMany({
      take: 100,
      orderBy: { criado_em: 'desc' },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, role: true },
        },
      },
    });

    return {
      success: true,
      data: logs,
      message: 'Logs de auditoria recuperados com sucesso.',
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditAction } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';
import type {
  CreateAlertDto,
  TriggerContingencyDto,
  CompleteContingencyChecklistDto,
} from './dto/contingency.dto.js';

export interface CivilDefenseAlertResponse {
  id: string;
  titulo: string;
  descricao: string;
  nivel: string;
  tipoEvento: string;
  fonte: string;
  inicioPrevisto?: string;
  fimPrevisto?: string;
  ativo: boolean;
  acoesRecomendadas: string[];
  totalVistorias: number;
  vistoriasConcluidas: number;
  vistoriasPendentes: number;
  percentualConformidade: number;
  prefeituraId?: string;
  criadoEm: string;
}

@Injectable()
export class ContingencyService {
  constructor(private readonly prisma: PrismaService) {}

  private getDefaultChecklist(tipoEvento?: string): Array<{ item: string; checado: boolean; observacao: string }> {
    const event = (tipoEvento || 'CHUVA_INTENSA').toUpperCase();

    if (event === 'VENDAVAL') {
      return [
        { item: 'Inspeção de fixação de telhas cerâmicas e metálicas, cumeeiras e rufos', checado: false, observacao: '' },
        { item: 'Avaliação preventiva de árvores e galhos próximos à fiação e coberturas', checado: false, observacao: '' },
        { item: 'Verificação de fixação de caixas d’água superiores, antenas e placas solares', checado: false, observacao: '' },
        { item: 'Checagem de travas de janelas, vidraças e portas externas', checado: false, observacao: '' },
      ];
    }

    if (event === 'ONDA_DE_CALOR') {
      return [
        { item: 'Inspeção de aquecimento e carga de disjuntores gerais e quadros elétricos', checado: false, observacao: '' },
        { item: 'Teste e monitoramento contínuo de climatização em salas de vacinas e remédios', checado: false, observacao: '' },
        { item: 'Verificação de abastecimento e pressão dos reservatórios de água potável', checado: false, observacao: '' },
      ];
    }

    if (event === 'DESCARGAS_ELETRICAS') {
      return [
        { item: 'Inspeção visual e continuidade da malha de captores e descidas do SPDA (Para-raios)', checado: false, observacao: '' },
        { item: 'Verificação de status operacional dos Dispositivos de Proteção contra Surtos (DPS)', checado: false, observacao: '' },
      ];
    }

    // Default: CHUVA_INTENSA / INUNDACAO
    return [
      { item: 'Desobstrução e limpeza imediata de calhas, ralos de cobertura e grelhas pluviais', checado: false, observacao: '' },
      { item: 'Inspeção e teste de bombas de drenagem de subsolo e poços de sucção', checado: false, observacao: '' },
      { item: 'Verificação de infiltrações ativas em lajes e vedação de janelas', checado: false, observacao: '' },
      { item: 'Checagem do gerador de emergência e quadro de transferência automática (QTA)', checado: false, observacao: '' },
    ];
  }

  async findAllAlerts(currentUser?: any): Promise<ApiResponse<CivilDefenseAlertResponse[]>> {
    const where: any = {};
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const alerts = await this.prisma.alertaDefesaCivil.findMany({
      where,
      orderBy: [{ ativo: 'desc' }, { criado_em: 'desc' }],
      include: {
        vistorias_contingencia: {
          select: {
            id: true,
            concluido: true,
            risco_mitigado: true,
          },
        },
      },
    });

    const mapped: CivilDefenseAlertResponse[] = alerts.map((a: any) => {
      const vistorias = a.vistorias_contingencia || [];
      const total = vistorias.length;
      const concluidas = vistorias.filter((v: any) => v.concluido).length;
      const pendentes = total - concluidas;
      const pct = total > 0 ? Number(((concluidas / total) * 100).toFixed(1)) : 0;

      return {
        id: a.id,
        titulo: a.titulo,
        descricao: a.descricao,
        nivel: a.nivel,
        tipoEvento: a.tipo_evento,
        fonte: a.fonte,
        inicioPrevisto: a.inicio_previsto ? a.inicio_previsto.toISOString() : undefined,
        fimPrevisto: a.fim_previsto ? a.fim_previsto.toISOString() : undefined,
        ativo: a.ativo !== false,
        acoesRecomendadas: Array.isArray(a.acoes_recomendadas) ? a.acoes_recomendadas : [],
        totalVistorias: total,
        vistoriasConcluidas: concluidas,
        vistoriasPendentes: pendentes,
        percentualConformidade: pct,
        prefeituraId: a.prefeitura_id || undefined,
        criadoEm: a.criado_em.toISOString(),
      };
    });

    return {
      success: true,
      data: mapped,
    };
  }

  async findAlertById(id: string, currentUser?: any): Promise<ApiResponse<any>> {
    const where: any = { id };
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const alert = await this.prisma.alertaDefesaCivil.findFirst({
      where,
      include: {
        vistorias_contingencia: {
          include: {
            predio: true,
          },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException(`Alerta de Defesa Civil "${id}" não encontrado.`);
    }

    return {
      success: true,
      data: alert,
    };
  }

  async createAlert(dto: CreateAlertDto, currentUser: any): Promise<ApiResponse<any>> {
    const prefeituraId = currentUser?.prefeituraId || null;

    const created = await this.prisma.alertaDefesaCivil.create({
      data: {
        titulo: dto.titulo.trim(),
        descricao: dto.descricao.trim(),
        nivel: dto.nivel?.toUpperCase() || 'PERIGO',
        tipo_evento: dto.tipoEvento?.toUpperCase() || 'CHUVA_INTENSA',
        fonte: dto.fonte?.toUpperCase() || 'DEFESA_CIVIL',
        inicio_previsto: dto.inicioPrevisto ? new Date(dto.inicioPrevisto) : new Date(),
        fim_previsto: dto.fimPrevisto ? new Date(dto.fimPrevisto) : null,
        ativo: true,
        acoes_recomendadas: dto.acoesRecomendadas || [],
        prefeitura_id: prefeituraId,
      },
    });

    if (currentUser?.id) {
      await this.prisma.auditoriaLog.create({
        data: {
          entidade_afetada: 'alertas_defesa_civil',
          entidade_id: created.id,
          acao: AuditAction.CREATE,
          usuario_id: currentUser.id,
          prefeitura_id: prefeituraId,
          dados_novos: {
            titulo: created.titulo,
            nivel: created.nivel,
            tipo_evento: created.tipo_evento,
          },
        },
      });
    }

    return {
      success: true,
      data: created,
      message: `Alerta de Defesa Civil (${created.nivel}) cadastrado com sucesso.`,
    };
  }

  async resolveAlert(id: string, currentUser: any): Promise<ApiResponse<any>> {
    const where: any = { id };
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const existing = await this.prisma.alertaDefesaCivil.findFirst({ where });
    if (!existing) {
      throw new NotFoundException(`Alerta "${id}" não encontrado.`);
    }

    const updated = await this.prisma.alertaDefesaCivil.update({
      where: { id },
      data: { ativo: false },
    });

    if (currentUser?.id) {
      await this.prisma.auditoriaLog.create({
        data: {
          entidade_afetada: 'alertas_defesa_civil',
          entidade_id: id,
          acao: AuditAction.UPDATE,
          usuario_id: currentUser.id,
          prefeitura_id: currentUser?.prefeituraId || null,
          dados_novos: { ativo: false, resolvido_em: new Date().toISOString() },
        },
      });
    }

    return {
      success: true,
      data: updated,
      message: 'Alerta meteorológico finalizado com sucesso.',
    };
  }

  /**
   * Aciona o Plano de Contingência Municipal:
   * Gera em lote vistorias de contingência preventiva na Agenda para os prédios vulneráveis,
   * com checklists específicos para o evento meteorológico previsto.
   */
  async triggerContingencyPlan(
    dto: TriggerContingencyDto,
    currentUser: any,
  ): Promise<ApiResponse<any>> {
    const prefeituraId = currentUser?.prefeituraId || null;
    const tipoEvento = (dto.tipoEvento || 'CHUVA_INTENSA').toUpperCase();
    const nivel = (dto.nivel || 'PERIGO').toUpperCase();

    // 1. Localizar prédios-alvo
    const wherePredio: any = { ativo: true };
    if (prefeituraId) {
      wherePredio.prefeitura_id = prefeituraId;
    }
    if (Array.isArray(dto.predioIds) && dto.predioIds.length > 0) {
      wherePredio.id = { in: dto.predioIds };
    }

    const predios = await this.prisma.predio.findMany({
      where: wherePredio,
      orderBy: [{ tipo: 'asc' }, { nome: 'asc' }],
    });

    if (predios.length === 0) {
      throw new BadRequestException('Nenhum prédio municipal ativo encontrado para aplicação do plano.');
    }

    // 2. Montar checklist inteligente do evento
    const checklistBase = dto.checklistPersonalizado && dto.checklistPersonalizado.length > 0
      ? dto.checklistPersonalizado.map((item) => ({ item, checado: false, observacao: '' }))
      : this.getDefaultChecklist(tipoEvento);

    const tipoVistoria = tipoEvento === 'CHUVA_INTENSA' ? 'hidraulica' : tipoEvento === 'VENDAVAL' ? 'alvenaria' : 'eletrica';

    // 3. Execução atômica no banco de dados
    const result = await this.prisma.$transaction(async (tx) => {
      const vistoriasCriadas = [];

      for (const p of predios) {
        const v = await tx.agendaVistoria.create({
          data: {
            titulo: `[DEFESA CIVIL] Contingência: ${tipoEvento} - ${p.nome}`,
            subtitulo: `${p.nome} (${p.tipo || 'Unidade'}) - Vistoria Preventiva de Risco`,
            horario: 'IMEDIATO / URGENTE',
            data_agendada: new Date(),
            tipo: tipoVistoria,
            recorrencia: 'UNICA',
            concluido: false,
            categoria_vistoria: 'CONTINGENCIA_CLIMA',
            alerta_defesa_civil_id: dto.alertaId || null,
            checklist_itens: checklistBase,
            predio_id: p.id,
            prefeitura_id: prefeituraId || p.prefeitura_id || null,
            ...(dto.tecnicoResponsavelId ? { tecnico_id: dto.tecnicoResponsavelId } : {}),
          },
        });
        vistoriasCriadas.push(v);
      }

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'alertas_defesa_civil',
            entidade_id: dto.alertaId || 'contingencia-geral',
            acao: AuditAction.CREATE,
            usuario_id: currentUser.id,
            prefeitura_id: prefeituraId,
            dados_novos: {
              acao: 'TRIGGER_CONTINGENCIA',
              tipo_evento: tipoEvento,
              nivel,
              vistorias_geradas_count: vistoriasCriadas.length,
            },
          },
        });
      }

      return vistoriasCriadas;
    });

    return {
      success: true,
      data: {
        tipoEvento,
        nivel,
        vistoriasGeradasCount: result.length,
        prediosImpactadosCount: predios.length,
        vistorias: result.map((v) => ({
          id: v.id,
          titulo: v.titulo,
          predioId: v.predio_id,
        })),
      },
      message: `Plano de contingência ativado! ${result.length} vistorias preventivas de emergência foram agendadas para as equipes de zeladoria.`,
    };
  }

  /**
   * Conclusão da vistoria de contingência com validação de itens de mitigação de risco.
   */
  async completeContingencyInspection(
    vistoriaId: string,
    dto: CompleteContingencyChecklistDto,
    currentUser: any,
  ): Promise<ApiResponse<any>> {
    const where: any = { id: vistoriaId };
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const vistoria = await this.prisma.agendaVistoria.findFirst({
      where,
      include: { predio: true },
    });

    if (!vistoria) {
      throw new NotFoundException(`Vistoria "${vistoriaId}" não encontrada.`);
    }

    const updated = await this.prisma.agendaVistoria.update({
      where: { id: vistoriaId },
      data: {
        concluido: true,
        risco_mitigado: dto.riscoMitigado !== false,
        laudo_tecnico: dto.laudoTecnico?.trim() || 'Vistoria de contingência concluída e itens inspecionados.',
        ...(dto.checklistItens ? { checklist_itens: dto.checklistItens as any } : {}),
        ...(dto.fotosVistoria ? { fotos_vistoria: dto.fotosVistoria } : {}),
      },
    });

    if (currentUser?.id) {
      await this.prisma.auditoriaLog.create({
        data: {
          entidade_afetada: 'agenda_vistorias',
          entidade_id: vistoriaId,
          acao: AuditAction.UPDATE,
          usuario_id: currentUser.id,
          prefeitura_id: currentUser?.prefeituraId || null,
          dados_novos: {
            concluido: true,
            risco_mitigado: updated.risco_mitigado,
            laudo_tecnico: updated.laudo_tecnico,
          },
        },
      });
    }

    return {
      success: true,
      data: updated,
      message: 'Vistoria de contingência finalizada com sucesso e registro de mitigação gravado.',
    };
  }
}

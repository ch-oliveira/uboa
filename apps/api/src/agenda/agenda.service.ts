import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditAction } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';
import type { CreateInspectionDto, CompleteInspectionDto } from './dto/agenda.dto.js';

export interface InspectionResponse {
  id: string;
  title: string;
  location: string;
  scheduledTime: string;
  scheduledDate?: string;
  type: string;
  recorrencia: string;
  isCompleted: boolean;
  technicianName?: string;
  technicianId?: string;
  facilityId?: string;
  facilityName?: string;
  workOrderId?: string;
  workOrderCode?: string;
  laudoTecnico?: string;
  fotosVistoria?: string[];
  createdAt: string;
  proximaEtapaSugerida?: string;
}

@Injectable()
export class AgendaService {
  constructor(private readonly prisma: PrismaService) {}

  private mapInspection(a: any, proximaEtapa?: string): InspectionResponse {
    return {
      id: a.id,
      title: a.titulo,
      location: a.predio?.nome || a.subtitulo,
      scheduledTime: a.horario,
      scheduledDate: a.data_agendada ? a.data_agendada.toISOString() : undefined,
      type: a.tipo,
      recorrencia: a.recorrencia || 'UNICA',
      isCompleted: a.concluido,
      technicianName: a.tecnico || undefined,
      technicianId: a.tecnico_id || undefined,
      facilityId: a.predio_id || undefined,
      facilityName: a.predio?.nome || undefined,
      workOrderId: a.ordem_servico_id || undefined,
      workOrderCode: a.ordem_servico?.codigo || undefined,
      laudoTecnico: a.laudo_tecnico || undefined,
      fotosVistoria: a.fotos_vistoria || [],
      createdAt: a.criado_em.toISOString(),
      proximaEtapaSugerida: proximaEtapa,
    };
  }

  async findAll(): Promise<ApiResponse<InspectionResponse[]>> {
    const items = await this.prisma.agendaVistoria.findMany({
      include: {
        predio: true,
        ordem_servico: true,
      },
      orderBy: [{ data_agendada: 'asc' }, { horario: 'asc' }],
    });

    const data: InspectionResponse[] = items.map((a: any) => this.mapInspection(a));

    return {
      success: true,
      data,
      meta: {
        total: data.length,
      },
    };
  }

  async findOne(id: string): Promise<ApiResponse<InspectionResponse>> {
    const item = await this.prisma.agendaVistoria.findUnique({
      where: { id },
      include: { predio: true, ordem_servico: true },
    });

    if (!item) {
      throw new NotFoundException(`Vistoria ${id} não encontrada.`);
    }

    return {
      success: true,
      data: this.mapInspection(item),
    };
  }

  async create(payload: CreateInspectionDto, currentUser?: any): Promise<ApiResponse<InspectionResponse>> {
    const title = payload.title?.trim();
    if (!title) {
      throw new BadRequestException('O título da vistoria é obrigatório.');
    }

    const scheduledTime = payload.scheduledTime?.trim() || '09:00';
    const type = (payload.type || payload.tipo || 'geral').toLowerCase();
    const recorrencia = (payload.recorrencia || 'UNICA').toUpperCase();
    const technicianName = (payload.technicianName || payload.tecnico)?.trim() || null;
    const technicianId = payload.technicianId || payload.tecnicoId || null;
    const facilityId = payload.facilityId || payload.predioId || null;
    const location = payload.location || payload.subtitulo || 'Unidade Municipal';
    const workOrderId = payload.workOrderId || payload.ordemServicoId || null;
    const scheduledDate = payload.dataAgendada ? new Date(payload.dataAgendada) : new Date();

    // 1. Verificação de Conflito de Horários do Técnico
    if (technicianName || technicianId) {
      const conflitos = await this.prisma.agendaVistoria.findMany({
        where: {
          concluido: false,
          horario: scheduledTime,
          OR: [
            ...(technicianName ? [{ tecnico: technicianName }] : []),
            ...(technicianId ? [{ tecnico_id: technicianId }] : []),
          ],
        },
        include: { predio: true },
      });

      for (const c of conflitos) {
        const cPredioId = c.predio_id;
        const cLocalizacao = c.predio?.nome || c.subtitulo;

        // Se for em unidade DIFERENTE, bloquear estritamente
        const mesmaUnidade =
          (facilityId && cPredioId && facilityId === cPredioId) ||
          location.toLowerCase().trim() === cLocalizacao.toLowerCase().trim();

        if (!mesmaUnidade) {
          throw new BadRequestException(
            `Conflito de agenda: o técnico ${technicianName || 'selecionado'} já possui vistoria agendada às ${scheduledTime} em outra unidade (${cLocalizacao}). Agendamentos no mesmo horário só são permitidos na mesma unidade predial.`,
          );
        }
      }
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const item = await tx.agendaVistoria.create({
        data: {
          titulo: title,
          subtitulo: location,
          horario: scheduledTime,
          data_agendada: scheduledDate,
          tipo: type,
          recorrencia,
          concluido: false,
          tecnico: technicianName,
          tecnico_id: technicianId,
          predio_id: facilityId,
          ordem_servico_id: workOrderId,
        },
        include: { predio: true, ordem_servico: true },
      });

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'AgendaVistoria',
            entidade_id: item.id,
            acao: AuditAction.CREATE,
            usuario_id: currentUser.id,
            dados_novos: {
              titulo: item.titulo,
              horario: item.horario,
              tecnico: item.tecnico,
              predio: item.subtitulo,
              recorrencia: item.recorrencia,
            },
          },
        });
      }

      return item;
    });

    return {
      success: true,
      data: this.mapInspection(created),
      message: 'Vistoria agendada com sucesso.',
    };
  }

  async complete(
    id: string,
    payload: CompleteInspectionDto,
    currentUser?: any,
  ): Promise<ApiResponse<InspectionResponse>> {
    const item = await this.prisma.agendaVistoria.findUnique({
      where: { id },
      include: { predio: true, ordem_servico: true },
    });

    if (!item) {
      throw new NotFoundException(`Vistoria ${id} não encontrada.`);
    }

    const isConcluding = payload.concluido !== undefined ? payload.concluido : !item.concluido;

    // 2. Parecer Técnico / Laudo Obrigatório para Concluir Vistoria
    const laudo = payload.laudoTecnico || payload.laudo || payload.parecer || item.laudo_tecnico;
    if (isConcluding && (!laudo || !laudo.trim())) {
      throw new BadRequestException(
        'A conclusão de uma vistoria técnica exige obrigatoriamente o registro de um parecer técnico / laudo da inspeção.',
      );
    }

    const fotos = payload.fotosVistoria || item.fotos_vistoria || [];

    // Human-in-the-loop: Sugestão para o Gestor sem forçar mutação cega na OS
    let proximaEtapa: string | undefined;
    if (isConcluding && item.ordem_servico) {
      proximaEtapa = `Vistoria concluída com parecer registrado. Sugestão para o Gestor: analisar os apontamentos do laudo e transicionar a OS ${item.ordem_servico.codigo} para EM_EXECUCAO se o reparo for aprovado.`;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const up = await tx.agendaVistoria.update({
        where: { id },
        data: {
          concluido: isConcluding,
          laudo_tecnico: isConcluding ? laudo?.trim() : item.laudo_tecnico,
          fotos_vistoria: fotos,
        },
        include: { predio: true, ordem_servico: true },
      });

      // 4. Manutenção Preventiva Recorrente: Se for plano recorrente concluído, agendar próximo ciclo
      if (isConcluding && item.recorrencia && item.recorrencia !== 'UNICA') {
        let diasAdicionais = 30; // MENSAL
        if (item.recorrencia === 'TRIMESTRAL') diasAdicionais = 90;
        else if (item.recorrencia === 'SEMESTRAL') diasAdicionais = 180;
        else if (item.recorrencia === 'ANUAL') diasAdicionais = 365;

        const baseDate = item.data_agendada || new Date();
        const proximaData = new Date(baseDate.getTime() + diasAdicionais * 24 * 3600 * 1000);

        await tx.agendaVistoria.create({
          data: {
            titulo: `${item.titulo} (Ciclo Preventivo)`,
            subtitulo: item.subtitulo,
            horario: item.horario,
            data_agendada: proximaData,
            tipo: item.tipo,
            recorrencia: item.recorrencia,
            concluido: false,
            tecnico: item.tecnico,
            tecnico_id: item.tecnico_id,
            predio_id: item.predio_id,
          },
        });
      }

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'AgendaVistoria',
            entidade_id: up.id,
            acao: AuditAction.UPDATE,
            usuario_id: currentUser.id,
            dados_novos: {
              concluido: isConcluding,
              laudo_tecnico: up.laudo_tecnico,
              fotos_count: fotos.length,
            },
          },
        });
      }

      return up;
    });

    return {
      success: true,
      data: this.mapInspection(updated, proximaEtapa),
      message: isConcluding
        ? 'Vistoria técnica concluída com sucesso e laudo registrado.'
        : 'Status da vistoria atualizado com sucesso.',
    };
  }

  async toggle(id: string, currentUser?: any): Promise<ApiResponse<InspectionResponse>> {
    const item = await this.prisma.agendaVistoria.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Vistoria não encontrada.');

    // Se estiver marcando como concluída sem laudo, exigir laudo
    if (!item.concluido && !item.laudo_tecnico) {
      throw new BadRequestException(
        'A conclusão da vistoria exige o registro de um parecer técnico / laudo da inspeção.',
      );
    }

    return this.complete(id, { concluido: !item.concluido }, currentUser);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusOS, Prioridade, AuditAction, TipoPredio } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';

export type ApiPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type ApiStatus = 'TRIAGE' | 'SCHEDULED' | 'IN_PROGRESS' | 'WAITING' | 'COMPLETED' | 'CANCELLED';

export interface WorkOrderResponse {
  id: string;
  code: string;
  title: string;
  description: string;
  facilityId: string;
  facilityName: string;
  requesterId: string;
  requesterName: string;
  technicianId?: string;
  technicianName?: string;
  priority: ApiPriority;
  status: ApiStatus;
  openedAt: string;
  photos: string[];
}

export interface WorkOrdersMeta {
  totalCount: number;
  openCount: number;
  triageCount: number;
  scheduledCount: number;
  inProgressCount: number;
  waitingCount: number;
  completedCount: number;
  urgentCount: number;
}

function toPrismaStatus(status?: string): StatusOS {
  if (!status) return StatusOS.EM_TRIAGEM;
  const s = status.toUpperCase();
  if (s === 'TRIAGE' || s === 'TRIAGEM' || s === 'RECEBIDO') return StatusOS.EM_TRIAGEM;
  if (s === 'SCHEDULED' || s === 'AGENDADO') return StatusOS.AGENDADO;
  if (s === 'WAITING' || s === 'AGUARDANDO') return StatusOS.AGUARDANDO;
  if (s === 'IN_PROGRESS' || s === 'EM_EXECUCAO') return StatusOS.EM_EXECUCAO;
  if (s === 'COMPLETED' || s === 'CONCLUIDO') return StatusOS.CONCLUIDO;
  if (s === 'CANCELLED' || s === 'CANCELADO') return StatusOS.CANCELADO;
  return StatusOS.EM_TRIAGEM;
}

function toApiStatus(status: StatusOS): ApiStatus {
  switch (status) {
    case StatusOS.RECEBIDO:
    case StatusOS.EM_TRIAGEM:
      return 'TRIAGE';
    case StatusOS.AGENDADO:
      return 'SCHEDULED';
    case StatusOS.AGUARDANDO:
      return 'WAITING';
    case StatusOS.EM_EXECUCAO:
      return 'IN_PROGRESS';
    case StatusOS.CONCLUIDO:
      return 'COMPLETED';
    case StatusOS.CANCELADO:
      return 'CANCELLED';
    default:
      return 'TRIAGE';
  }
}

function toPrismaPriority(priority?: string): Prioridade {
  if (!priority) return Prioridade.MEDIA;
  const p = priority.toUpperCase();
  if (p === 'URGENT' || p === 'URGENTE') return Prioridade.URGENTE;
  if (p === 'HIGH' || p === 'ALTA') return Prioridade.ALTA;
  if (p === 'LOW' || p === 'BAIXA') return Prioridade.BAIXA;
  return Prioridade.MEDIA;
}

function toApiPriority(priority: Prioridade): ApiPriority {
  switch (priority) {
    case Prioridade.URGENTE:
      return 'URGENT';
    case Prioridade.ALTA:
      return 'HIGH';
    case Prioridade.BAIXA:
      return 'LOW';
    case Prioridade.MEDIA:
    default:
      return 'MEDIUM';
  }
}

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapOrder(o: any): WorkOrderResponse {
    return {
      id: o.id,
      code: o.codigo,
      title: o.titulo,
      description: o.descricao,
      facilityId: o.predio_id || o.predio?.id,
      facilityName: o.predio?.nome || 'Unidade Municipal',
      requesterId: o.solicitante_id || o.solicitante?.id,
      requesterName: o.solicitante?.nome || 'Solicitante',
      technicianId: o.tecnico?.id || o.tecnico_atribuido_id || undefined,
      technicianName: o.tecnico?.nome || undefined,
      priority: toApiPriority(o.prioridade),
      status: toApiStatus(o.status),
      openedAt: o.criado_em.toISOString(),
      photos: o.fotos || [],
    };
  }

  async findAll(filter?: {
    role?: string;
    predio?: string;
    facility?: string;
    tecnico?: string;
    technician?: string;
    status?: string;
    priority?: string;
    prioridade?: string;
  }): Promise<ApiResponse<WorkOrderResponse[], WorkOrdersMeta>> {
    const where: any = {};

    const facilityFilter = filter?.facility || filter?.predio;
    if (facilityFilter && facilityFilter !== 'TODOS' && facilityFilter !== 'ALL') {
      where.predio = {
        nome: {
          contains: facilityFilter,
          mode: 'insensitive',
        },
      };
    }

    const technicianFilter = filter?.technician || filter?.tecnico;
    if (technicianFilter && technicianFilter !== 'TODOS' && technicianFilter !== 'ALL') {
      where.tecnico = {
        nome: {
          contains: technicianFilter,
          mode: 'insensitive',
        },
      };
    }

    if (filter?.status && filter.status !== 'TODOS' && filter.status !== 'ALL') {
      where.status = toPrismaStatus(filter.status);
    }

    const priorityFilter = filter?.priority || filter?.prioridade;
    if (priorityFilter && priorityFilter !== 'TODAS' && priorityFilter !== 'ALL') {
      where.prioridade = toPrismaPriority(priorityFilter);
    }

    const items = await this.prisma.ordemServico.findMany({
      where,
      include: {
        predio: true,
        solicitante: true,
        tecnico: true,
      },
      orderBy: { criado_em: 'desc' },
    });

    const data: WorkOrderResponse[] = items.map((o: any) => this.mapOrder(o));

    const nonConcluded = data.filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    const meta: WorkOrdersMeta = {
      totalCount: data.length,
      openCount: nonConcluded.length,
      triageCount: data.filter((o) => o.status === 'TRIAGE').length,
      scheduledCount: data.filter((o) => o.status === 'SCHEDULED').length,
      inProgressCount: data.filter((o) => o.status === 'IN_PROGRESS').length,
      waitingCount: data.filter((o) => o.status === 'WAITING').length,
      completedCount: data.filter((o) => o.status === 'COMPLETED').length,
      urgentCount: data.filter((o) => o.status !== 'COMPLETED' && o.priority === 'URGENT').length,
    };

    return {
      success: true,
      data,
      meta,
    };
  }

  async findOne(idOrCode: string): Promise<ApiResponse<WorkOrderResponse>> {
    const o = await this.prisma.ordemServico.findFirst({
      where: {
        OR: [{ id: idOrCode }, { codigo: idOrCode }],
      },
      include: { predio: true, solicitante: true, tecnico: true },
    });

    if (!o) throw new NotFoundException('Work order not found.');

    return {
      success: true,
      data: this.mapOrder(o),
    };
  }

  async create(payload: any): Promise<ApiResponse<WorkOrderResponse>> {
    const title = payload.title || payload.titulo;
    const description = payload.description || payload.descricao || 'Sem descrição detalhada';
    const facilityName = payload.facilityName || payload.predio;
    const priority = toPrismaPriority(payload.priority || payload.prioridade);
    const technicianName = payload.technicianName || payload.tecnico;
    const photos = payload.photos || payload.fotos || [];

    // 1. Encontrar ou criar o Prédio
    let predioRecord = await this.prisma.predio.findFirst({
      where: { nome: { contains: facilityName, mode: 'insensitive' } },
    });
    if (!predioRecord) {
      predioRecord = await this.prisma.predio.create({
        data: {
          nome: facilityName || 'Unidade Municipal',
          tipo: TipoPredio.ADMINISTRATIVO,
          endereco: 'Unidade Municipal',
        },
      });
    }

    // 2. Encontrar ou usar o Solicitante
    let solicitanteUser = await this.prisma.usuario.findFirst({
      where: { email: 'maria.escola@zelo.gov.br' },
    });
    if (!solicitanteUser) {
      solicitanteUser = await this.prisma.usuario.findFirst();
    }

    // 3. Encontrar Técnico se fornecido
    let tecnicoId: string | null = null;
    if (technicianName) {
      const tecnicoUser = await this.prisma.usuario.findFirst({
        where: { nome: { contains: technicianName, mode: 'insensitive' } },
      });
      if (tecnicoUser) tecnicoId = tecnicoUser.id;
    }

    const code = payload.code || payload.codigo || payload.id || `OS-${Math.floor(100000 + Math.random() * 900000)}`;

    const created = await this.prisma.ordemServico.create({
      data: {
        codigo: code,
        titulo: title,
        descricao: description,
        prioridade: priority,
        status: StatusOS.EM_TRIAGEM,
        predio_id: predioRecord.id,
        solicitante_id: solicitanteUser!.id,
        tecnico_atribuido_id: tecnicoId,
        fotos: photos,
      },
      include: { predio: true, solicitante: true, tecnico: true },
    });

    // Auditoria
    await this.prisma.auditoriaLog.create({
      data: {
        entidade_afetada: 'OrdemServico',
        entidade_id: created.id,
        acao: AuditAction.CREATE,
        usuario_id: solicitanteUser!.id,
        dados_novos: { codigo: created.codigo, titulo: created.titulo },
      },
    });

    return {
      success: true,
      data: this.mapOrder(created),
      message: `Work order ${created.codigo} registered successfully.`,
    };
  }

  async update(idOrCode: string, updates: any): Promise<ApiResponse<WorkOrderResponse>> {
    const existing = await this.prisma.ordemServico.findFirst({
      where: { OR: [{ id: idOrCode }, { codigo: idOrCode }] },
      include: { predio: true, solicitante: true, tecnico: true },
    });

    if (!existing) throw new NotFoundException('Work order not found.');

    const updateData: any = {};
    if (updates.title || updates.titulo) updateData.titulo = updates.title || updates.titulo;
    if (updates.description || updates.descricao) updateData.descricao = updates.description || updates.descricao;
    if (updates.priority || updates.prioridade) updateData.prioridade = toPrismaPriority(updates.priority || updates.prioridade);
    if (updates.status) updateData.status = toPrismaStatus(updates.status);

    const technician = updates.technicianName || updates.technician || updates.tecnico;
    if (technician) {
      const tecnicoUser = await this.prisma.usuario.findFirst({
        where: { nome: { contains: technician, mode: 'insensitive' } },
      });
      if (tecnicoUser) updateData.tecnico_atribuido_id = tecnicoUser.id;
    }

    const updated = await this.prisma.ordemServico.update({
      where: { id: existing.id },
      data: updateData,
      include: { predio: true, solicitante: true, tecnico: true },
    });

    return {
      success: true,
      data: this.mapOrder(updated),
      message: `Work order ${updated.codigo} updated successfully.`,
    };
  }

  async remove(idOrCode: string): Promise<ApiResponse<null>> {
    const existing = await this.prisma.ordemServico.findFirst({
      where: { OR: [{ id: idOrCode }, { codigo: idOrCode }] },
    });

    if (!existing) throw new NotFoundException('Work order not found.');

    await this.prisma.ordemServico.delete({
      where: { id: existing.id },
    });

    return {
      success: true,
      data: null,
      message: `Work order ${existing.codigo} deleted successfully.`,
    };
  }
}

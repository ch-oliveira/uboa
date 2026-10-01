import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusOS, Prioridade, AuditAction, TipoPredio, Role } from '@repo/database';
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
      facilityId: o.predio_id,
      facilityName: o.predio?.nome || 'Unidade Municipal',
      requesterId: o.solicitante_id,
      requesterName: o.solicitante?.nome || 'Gestão Municipal',
      technicianId: o.tecnico_atribuido_id || undefined,
      technicianName: o.tecnico?.nome || undefined,
      priority: toApiPriority(o.prioridade),
      status: toApiStatus(o.status),
      openedAt: o.criado_em.toISOString(),
      photos: o.fotos || [],
    };
  }

  async findAll(
    filter?: {
      role?: string;
      predio?: string;
      facility?: string;
      tecnico?: string;
      technician?: string;
      status?: string;
      priority?: string;
      prioridade?: string;
    },
    currentUser?: any,
  ): Promise<ApiResponse<WorkOrderResponse[], WorkOrdersMeta>> {
    const where: any = {};

    // 1. Escopo forçado pelo perfil do usuário autenticado (BOLA / IDOR protection)
    if (currentUser?.role === Role.SOLICITANTE) {
      if (currentUser.facilityName) {
        where.predio = {
          nome: { contains: currentUser.facilityName, mode: 'insensitive' },
        };
      } else {
        where.solicitante_id = currentUser.id;
      }
    } else if (currentUser?.role === Role.TECNICO) {
      where.tecnico_atribuido_id = currentUser.id;
    } else {
      // Gestor e Admin podem filtrar por prédio ou técnico livremente
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

    if (!o) throw new NotFoundException('Ordem de serviço não encontrada.');

    return {
      success: true,
      data: this.mapOrder(o),
    };
  }

  async create(payload: any, currentUser?: any): Promise<ApiResponse<WorkOrderResponse>> {
    const title = payload.title || payload.titulo;
    const description = payload.description || payload.descricao || 'Sem descrição detalhada';
    const facilityName = payload.facilityName || payload.predio;
    const priority = toPrismaPriority(payload.priority || payload.prioridade);
    const technicianName = payload.technicianName || payload.tecnico;
    const photos = Array.isArray(payload.photos || payload.fotos) ? (payload.photos || payload.fotos) : [];

    // 1. Encontrar o Prédio ou associar ao padrão
    let predioRecord = await this.prisma.predio.findFirst({
      where: { nome: { contains: facilityName, mode: 'insensitive' } },
    });
    if (!predioRecord) {
      predioRecord = await this.prisma.predio.findFirst();
    }
    if (!predioRecord) {
      predioRecord = await this.prisma.predio.create({
        data: {
          nome: facilityName || 'Unidade Municipal',
          tipo: TipoPredio.ADMINISTRATIVO,
          endereco: 'Sede Administrativa Municipal',
        },
      });
    }

    // 2. Solicitante Real
    let solicitanteId = currentUser?.id;
    if (!solicitanteId) {
      let publicUser = await this.prisma.usuario.findFirst({
        where: { email: 'maria.escola@zelo.gov.br' },
      });
      if (!publicUser) publicUser = await this.prisma.usuario.findFirst();
      solicitanteId = publicUser!.id;
    }

    // 3. Encontrar Técnico se fornecido
    let tecnicoId: string | null = null;
    if (technicianName) {
      const tecnicoUser = await this.prisma.usuario.findFirst({
        where: { nome: { contains: technicianName, mode: 'insensitive' } },
      });
      if (tecnicoUser) tecnicoId = tecnicoUser.id;
    }

    const code = `OS-${Math.floor(100000 + Math.random() * 900000)}`;

    // Transação atômica: entidade e registro de auditoria gravados juntos
    const created = await this.prisma.$transaction(async (tx) => {
      const order = await tx.ordemServico.create({
        data: {
          codigo: code,
          titulo: title || 'Demanda Registrada',
          descricao: description,
          prioridade: priority,
          status: StatusOS.EM_TRIAGEM,
          predio_id: predioRecord.id,
          solicitante_id: solicitanteId,
          tecnico_atribuido_id: tecnicoId,
          fotos: photos.slice(0, 10), // Limite de 10 fotos para proteção DoS
        },
        include: { predio: true, solicitante: true, tecnico: true },
      });

      await tx.auditoriaLog.create({
        data: {
          entidade_afetada: 'OrdemServico',
          entidade_id: order.id,
          acao: AuditAction.CREATE,
          usuario_id: solicitanteId,
          dados_novos: { 
            codigo: order.codigo, 
            titulo: order.titulo,
            origem: currentUser ? 'UsuarioAutenticado' : 'PortalPublico'
          },
        },
      });

      return order;
    });

    return {
      success: true,
      data: this.mapOrder(created),
      message: `Ordem de serviço ${created.codigo} registrada com sucesso.`,
    };
  }

  async update(idOrCode: string, updates: any, currentUser?: any): Promise<ApiResponse<WorkOrderResponse>> {
    const existing = await this.prisma.ordemServico.findFirst({
      where: { OR: [{ id: idOrCode }, { codigo: idOrCode }] },
      include: { predio: true, solicitante: true, tecnico: true },
    });

    if (!existing) throw new NotFoundException('Ordem de serviço não encontrada.');

    // Verificação de permissão para técnicos: técnico só pode atualizar suas próprias OSs
    if (currentUser?.role === Role.TECNICO && existing.tecnico_atribuido_id !== currentUser.id) {
      throw new ForbiddenException('Técnicos só podem atualizar ordens atribuídas a si mesmos.');
    }

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

    // Transação atômica: atualização e auditoria síncronas
    const updated = await this.prisma.$transaction(async (tx) => {
      const order = await tx.ordemServico.update({
        where: { id: existing.id },
        data: updateData,
        include: { predio: true, solicitante: true, tecnico: true },
      });

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'OrdemServico',
            entidade_id: order.id,
            acao: AuditAction.UPDATE,
            usuario_id: currentUser.id,
            dados_antigos: { status: existing.status, prioridade: existing.prioridade },
            dados_novos: updateData,
          },
        });
      }

      return order;
    });

    return {
      success: true,
      data: this.mapOrder(updated),
      message: `Ordem de serviço ${updated.codigo} atualizada com sucesso.`,
    };
  }

  async remove(idOrCode: string, currentUser?: any): Promise<ApiResponse<null>> {
    const existing = await this.prisma.ordemServico.findFirst({
      where: { OR: [{ id: idOrCode }, { codigo: idOrCode }] },
    });

    if (!existing) throw new NotFoundException('Ordem de serviço não encontrada.');

    // Transação atômica de remoção e auditoria
    await this.prisma.$transaction(async (tx) => {
      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'OrdemServico',
            entidade_id: existing.id,
            acao: AuditAction.DELETE,
            usuario_id: currentUser.id,
            dados_antigos: { codigo: existing.codigo, titulo: existing.titulo },
          },
        });
      }

      await tx.ordemServico.delete({
        where: { id: existing.id },
      });
    });

    return {
      success: true,
      data: null,
      message: `Ordem de serviço ${existing.codigo} removida com sucesso.`,
    };
  }
}

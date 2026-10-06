import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
  photosCompletion?: string[];
  pauseReason?: string;
  cancellationReason?: string;
  slaDeadline?: string;
  startedAt?: string;
  completedAt?: string;
  linkedOrderId?: string;
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
      photosCompletion: o.fotos_conclusao || [],
      pauseReason: o.motivo_pausa || undefined,
      cancellationReason: o.motivo_cancelamento || undefined,
      slaDeadline: o.data_limite_sla ? o.data_limite_sla.toISOString() : undefined,
      startedAt: o.iniciado_em ? o.iniciado_em.toISOString() : undefined,
      completedAt: o.concluido_em ? o.concluido_em.toISOString() : undefined,
      linkedOrderId: o.ordem_vinculada_id || undefined,
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
    const ordemVinculadaId = payload.ordemVinculadaId || payload.ordem_vinculada_id;

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

    // 4. Calcular data_limite_sla com base na configuração do sistema
    let slaHoras = 72; // default MEDIA
    const config = await this.prisma.configuracaoSistema.findFirst();
    if (priority === Prioridade.URGENTE) slaHoras = config?.sla_urgente_h ?? 4;
    else if (priority === Prioridade.ALTA) slaHoras = config?.sla_alta_h ?? 24;
    else if (priority === Prioridade.BAIXA) slaHoras = config?.sla_baixa_h ?? 168;
    else slaHoras = config?.sla_media_h ?? 72;

    const dataLimiteSla = new Date(Date.now() + slaHoras * 3600 * 1000);

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
          fotos_conclusao: [],
          data_limite_sla: dataLimiteSla,
          ordem_vinculada_id: ordemVinculadaId || null,
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
            prioridade: order.prioridade,
            data_limite_sla: dataLimiteSla.toISOString(),
            ordem_vinculada_id: ordemVinculadaId,
            origem: currentUser ? 'UsuarioAutenticado' : 'PortalPublico'
          },
        },
      });

      return order;
    });

    return {
      success: true,
      data: this.mapOrder(created),
      message: `Ordem de serviço ${created.codigo} registrada com sucesso. Prazo SLA: ${slaHoras}h.`,
    };
  }

  async update(idOrCode: string, updates: any, currentUser?: any): Promise<ApiResponse<WorkOrderResponse>> {
    const existing = await this.prisma.ordemServico.findFirst({
      where: { OR: [{ id: idOrCode }, { codigo: idOrCode }] },
      include: { predio: true, solicitante: true, tecnico: true },
    });

    if (!existing) throw new NotFoundException('Ordem de serviço não encontrada.');

    // 1. REGRA DE TERMINALIDADE: CONCLUIDO e CANCELADO não podem sofrer mutação
    if (existing.status === StatusOS.CONCLUIDO || existing.status === StatusOS.CANCELADO) {
      throw new BadRequestException(
        `A ordem ${existing.codigo} possui status terminal (${existing.status}) e não pode ser modificada. Para contestações, abra uma nova OS vinculada.`
      );
    }

    const targetStatus = updates.status ? toPrismaStatus(updates.status) : existing.status;

    // 2. REGRA DE RBAC PARA TÉCNICOS
    if (currentUser?.role === Role.TECNICO) {
      if (existing.tecnico_atribuido_id !== currentUser.id) {
        throw new ForbiddenException('Técnicos só podem atualizar ordens atribuídas a si mesmos.');
      }
      if (updates.priority || updates.prioridade) {
        throw new ForbiddenException('Técnicos não possuem permissão para alterar a prioridade da OS.');
      }
      if (updates.technician || updates.technicianName || updates.tecnico) {
        throw new ForbiddenException('Técnicos não possuem permissão para reatribuir técnicos.');
      }
      if (targetStatus === StatusOS.CANCELADO) {
        throw new ForbiddenException('Apenas gestores e administradores podem cancelar ordens de serviço.');
      }
    }

    // 3. MÁQUINA DE ESTADOS RÍGIDA
    const validTransitions: Record<StatusOS, StatusOS[]> = {
      [StatusOS.RECEBIDO]: [StatusOS.EM_TRIAGEM, StatusOS.AGENDADO, StatusOS.EM_EXECUCAO, StatusOS.CANCELADO],
      [StatusOS.EM_TRIAGEM]: [StatusOS.AGENDADO, StatusOS.EM_EXECUCAO, StatusOS.CANCELADO],
      [StatusOS.AGENDADO]: [StatusOS.EM_EXECUCAO, StatusOS.CANCELADO],
      [StatusOS.EM_EXECUCAO]: [StatusOS.AGUARDANDO, StatusOS.CONCLUIDO, StatusOS.CANCELADO],
      [StatusOS.AGUARDANDO]: [StatusOS.EM_EXECUCAO, StatusOS.CONCLUIDO, StatusOS.CANCELADO],
      [StatusOS.CONCLUIDO]: [],
      [StatusOS.CANCELADO]: [],
    };

    if (targetStatus !== existing.status) {
      const allowed = validTransitions[existing.status] || [];
      if (!allowed.includes(targetStatus)) {
        throw new BadRequestException(
          `Transição de status inválida: não é permitido alterar de ${existing.status} para ${targetStatus}.`
        );
      }
    }

    const updateData: any = {};
    if (updates.title || updates.titulo) updateData.titulo = updates.title || updates.titulo;
    if (updates.description || updates.descricao) updateData.descricao = updates.description || updates.descricao;
    if (updates.priority || updates.prioridade) updateData.prioridade = toPrismaPriority(updates.priority || updates.prioridade);

    const technician = updates.technicianName || updates.technician || updates.tecnico;
    if (technician) {
      const tecnicoUser = await this.prisma.usuario.findFirst({
        where: { nome: { contains: technician, mode: 'insensitive' } },
      });
      if (tecnicoUser) updateData.tecnico_atribuido_id = tecnicoUser.id;
    }

    // Guardrails específicos de transição
    if (targetStatus !== existing.status) {
      updateData.status = targetStatus;

      // Início de Execução
      if (targetStatus === StatusOS.EM_EXECUCAO) {
        if (!existing.iniciado_em) {
          updateData.iniciado_em = new Date();
        }
      }

      // Pausa (AGUARDANDO) - Justificativa obrigatória
      if (targetStatus === StatusOS.AGUARDANDO) {
        const motivoPausa = updates.motivoPausa || updates.motivo_pausa;
        if (!motivoPausa || typeof motivoPausa !== 'string' || !motivoPausa.trim()) {
          throw new BadRequestException('Para pausar o chamado (AGUARDANDO), o motivo da pausa é obrigatório.');
        }
        updateData.motivo_pausa = motivoPausa.trim();
      }

      // Conclusão (CONCLUIDO) - Foto comprobatória obrigatória
      if (targetStatus === StatusOS.CONCLUIDO) {
        const fotosConclusao = Array.isArray(updates.fotosConclusao || updates.fotos_conclusao)
          ? (updates.fotosConclusao || updates.fotos_conclusao)
          : [];
        const existingConclusao = existing.fotos_conclusao || [];

        if (fotosConclusao.length === 0 && existingConclusao.length === 0) {
          throw new BadRequestException(
            'Para concluir a ordem de serviço, é obrigatório anexar ao menos uma foto do serviço finalizado (depois).'
          );
        }

        if (fotosConclusao.length > 0) {
          updateData.fotos_conclusao = fotosConclusao;
        }
        updateData.concluido_em = new Date();
      }

      // Cancelamento (CANCELADO) - Apenas Admin/Gestor com motivo obrigatório
      if (targetStatus === StatusOS.CANCELADO) {
        if (currentUser?.role && currentUser.role !== Role.ADMIN && currentUser.role !== Role.GESTOR) {
          throw new ForbiddenException('Apenas ADMIN e GESTOR podem cancelar uma ordem de serviço.');
        }
        const motivoCancelamento = updates.motivoCancelamento || updates.motivo_cancelamento;
        if (!motivoCancelamento || typeof motivoCancelamento !== 'string' || !motivoCancelamento.trim()) {
          throw new BadRequestException('Para cancelar a ordem de serviço, o motivo do cancelamento é obrigatório para auditoria.');
        }
        updateData.motivo_cancelamento = motivoCancelamento.trim();
      }
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
            dados_antigos: { 
              status: existing.status, 
              prioridade: existing.prioridade,
              tecnico_id: existing.tecnico_atribuido_id
            },
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

  async remove(idOrCode: string, motivo?: string, currentUser?: any): Promise<ApiResponse<null>> {
    const existing = await this.prisma.ordemServico.findFirst({
      where: { OR: [{ id: idOrCode }, { codigo: idOrCode }] },
    });

    if (!existing) throw new NotFoundException('Ordem de serviço não encontrada.');

    // 1. REGRA TRIBUNAL DE CONTAS: Hard delete banido
    if (existing.status === StatusOS.CONCLUIDO) {
      throw new BadRequestException('Ordens de serviço concluídas não podem ser excluídas ou canceladas.');
    }

    if (existing.status === StatusOS.CANCELADO) {
      throw new BadRequestException('Esta ordem de serviço já se encontra cancelada.');
    }

    const motivoFinal = motivo?.trim() || 'Cancelamento solicitado pela administração via portal';

    // Transação atômica de soft-cancelamento e auditoria permanente
    await this.prisma.$transaction(async (tx) => {
      await tx.ordemServico.update({
        where: { id: existing.id },
        data: {
          status: StatusOS.CANCELADO,
          motivo_cancelamento: motivoFinal,
        },
      });

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'OrdemServico',
            entidade_id: existing.id,
            acao: AuditAction.UPDATE,
            usuario_id: currentUser.id,
            dados_antigos: { status: existing.status, motivo_cancelamento: existing.motivo_cancelamento },
            dados_novos: { 
              status: StatusOS.CANCELADO, 
              motivo_cancelamento: motivoFinal, 
              motivo_operacao: 'Hard delete bloqueado para conformidade do Tribunal de Contas' 
            },
          },
        });
      }
    });

    return {
      success: true,
      data: null,
      message: `Ordem de serviço ${existing.codigo} cancelada com sucesso para preservação de histórico e auditoria.`,
    };
  }
}

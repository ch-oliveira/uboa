import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TipoPredio, StatusOS, Prioridade, AuditAction } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';

export interface FacilityResponse {
  id: string;
  name: string;
  type: string;
  address: string;
  managerName: string;
  phoneNumber: string;
  openTicketsCount: number;
  urgentTicketsCount: number;
  completedTicketsCount: number;
  totalTicketsCount: number;
  healthStatus: 'CRITICAL' | 'ATTENTION' | 'REGULAR';
}

@Injectable()
export class FacilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ApiResponse<FacilityResponse[]>> {
    const predios = await this.prisma.predio.findMany({
      include: {
        gestor: true,
        ordens_servico: true,
      },
      orderBy: { nome: 'asc' },
    });

    const data: FacilityResponse[] = predios.map((p: any) => {
      const openCount = p.ordens_servico.filter((o: any) => o.status !== StatusOS.CONCLUIDO).length;
      const urgentCount = p.ordens_servico.filter(
        (o: any) => o.status !== StatusOS.CONCLUIDO && o.prioridade === Prioridade.URGENTE
      ).length;
      const completedCount = p.ordens_servico.filter((o: any) => o.status === StatusOS.CONCLUIDO).length;

      let healthStatus: 'CRITICAL' | 'ATTENTION' | 'REGULAR' = 'REGULAR';
      if (urgentCount > 0) healthStatus = 'CRITICAL';
      else if (openCount > 0) healthStatus = 'ATTENTION';

      return {
        id: p.id,
        name: p.nome,
        type: p.tipo,
        address: p.endereco,
        managerName: p.gestor?.nome || 'Gestão da Unidade',
        phoneNumber: p.gestor?.telefone || '(11) 4589-0000',
        openTicketsCount: openCount,
        urgentTicketsCount: urgentCount,
        completedTicketsCount: completedCount,
        totalTicketsCount: p.ordens_servico.length,
        healthStatus,
      };
    });

    return {
      success: true,
      data,
      meta: {
        total: data.length,
      },
    };
  }

  async create(payload: any, currentUser?: any): Promise<ApiResponse<FacilityResponse>> {
    const name = payload.name || payload.nome;
    const type = payload.type || payload.tipo || TipoPredio.ADMINISTRATIVO;
    const address = payload.address || payload.endereco;
    const managerName = payload.managerName || payload.gestor || 'Gestão Municipal';
    const phoneNumber = payload.phoneNumber || payload.telefone || '(11) 4589-0000';

    const gestorUser = await this.prisma.usuario.findFirst({
      where: { role: 'GESTOR' },
    });

    // Transação atômica: criação de unidade municipal e registro de auditoria
    const created = await this.prisma.$transaction(async (tx) => {
      const predio = await tx.predio.create({
        data: {
          nome: name,
          tipo: type,
          endereco: address,
          gestor_id: gestorUser?.id,
        },
      });

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'Predio',
            entidade_id: predio.id,
            acao: AuditAction.CREATE,
            usuario_id: currentUser.id,
            dados_novos: { nome: predio.nome, tipo: predio.tipo },
          },
        });
      }

      return predio;
    });

    return {
      success: true,
      data: {
        id: created.id,
        name: created.nome,
        type: created.tipo,
        address: created.endereco,
        managerName,
        phoneNumber,
        openTicketsCount: 0,
        urgentTicketsCount: 0,
        completedTicketsCount: 0,
        totalTicketsCount: 0,
        healthStatus: 'REGULAR',
      },
      message: 'Facility created successfully.',
    };
  }
}

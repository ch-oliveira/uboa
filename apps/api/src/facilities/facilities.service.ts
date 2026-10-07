import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TipoPredio, StatusOS, Prioridade, AuditAction } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';
import type { CreateFacilityDto, UpdateFacilityDto } from './dto/facility.dto.js';

export interface FacilityResponse {
  id: string;
  name: string;
  type: string;
  setor?: string;
  porte?: string;
  capacidade?: number;
  address: string;
  latitude?: number;
  longitude?: number;
  ativo: boolean;
  motivoDesativacao?: string;
  managerId?: string;
  managerName: string;
  phoneNumber: string;
  openTicketsCount: number;
  urgentTicketsCount: number;
  completedTicketsCount: number;
  totalTicketsCount: number;
  healthStatus: 'CRITICAL' | 'ATTENTION' | 'REGULAR';
}

function toPrismaTipoPredio(type?: string): TipoPredio {
  if (!type) return TipoPredio.ADMINISTRATIVO;
  const t = type.toUpperCase().trim();
  if (t === 'ESCOLA') return TipoPredio.ESCOLA;
  if (t === 'HOSPITAL') return TipoPredio.HOSPITAL;
  if (t === 'UBS') return TipoPredio.UBS;
  if (t === 'PRACA' || t === 'PRAÇA') return TipoPredio.PRACA;
  return TipoPredio.ADMINISTRATIVO;
}

@Injectable()
export class FacilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  private mapFacility(p: any): FacilityResponse {
    const ordens = p.ordens_servico || [];
    const openCount = ordens.filter(
      (o: any) => o.status !== StatusOS.CONCLUIDO && o.status !== StatusOS.CANCELADO,
    ).length;
    const urgentCount = ordens.filter(
      (o: any) =>
        o.status !== StatusOS.CONCLUIDO &&
        o.status !== StatusOS.CANCELADO &&
        o.prioridade === Prioridade.URGENTE,
    ).length;
    const completedCount = ordens.filter((o: any) => o.status === StatusOS.CONCLUIDO).length;

    let healthStatus: 'CRITICAL' | 'ATTENTION' | 'REGULAR' = 'REGULAR';
    if (urgentCount > 0) healthStatus = 'CRITICAL';
    else if (openCount > 0) healthStatus = 'ATTENTION';

    return {
      id: p.id,
      name: p.nome,
      type: p.tipo,
      setor: p.setor || undefined,
      porte: p.porte || 'MEDIO',
      capacidade: p.capacidade || undefined,
      address: p.endereco,
      latitude: p.latitude !== null && p.latitude !== undefined ? Number(p.latitude) : undefined,
      longitude: p.longitude !== null && p.longitude !== undefined ? Number(p.longitude) : undefined,
      ativo: p.ativo !== false,
      motivoDesativacao: p.motivo_desativacao || undefined,
      managerId: p.gestor_id || undefined,
      managerName: p.gestor?.nome || 'Gestão da Unidade',
      phoneNumber: '(11) 3241-8900', // Canal institucional oficial de zeladoria municipal
      openTicketsCount: openCount,
      urgentTicketsCount: urgentCount,
      completedTicketsCount: completedCount,
      totalTicketsCount: ordens.length,
      healthStatus,
    };
  }

  async findAll(params?: {
    status?: string;
    setor?: string;
    tipo?: string;
    ativo?: string;
  }): Promise<ApiResponse<FacilityResponse[]>> {
    const where: any = {};

    if (params?.tipo && params.tipo !== 'TODOS' && params.tipo !== 'ALL') {
      where.tipo = toPrismaTipoPredio(params.tipo);
    }

    if (params?.setor && params.setor !== 'TODOS' && params.setor !== 'ALL') {
      where.setor = { contains: params.setor, mode: 'insensitive' };
    }

    if (params?.ativo !== undefined) {
      if (params.ativo === 'true' || params.ativo === 'ATIVO') where.ativo = true;
      else if (params.ativo === 'false' || params.ativo === 'DESATIVADO') where.ativo = false;
    }

    const predios = await this.prisma.predio.findMany({
      where,
      include: {
        gestor: true,
        ordens_servico: true,
      },
      orderBy: { nome: 'asc' },
    });

    const data: FacilityResponse[] = predios.map((p: any) => this.mapFacility(p));

    return {
      success: true,
      data,
      meta: {
        total: data.length,
      },
    };
  }

  async findOne(id: string): Promise<ApiResponse<FacilityResponse>> {
    const predio = await this.prisma.predio.findUnique({
      where: { id },
      include: {
        gestor: true,
        ordens_servico: true,
      },
    });

    if (!predio) {
      throw new NotFoundException(`Unidade predial ${id} não encontrada.`);
    }

    return {
      success: true,
      data: this.mapFacility(predio),
    };
  }

  async create(payload: CreateFacilityDto, currentUser?: any): Promise<ApiResponse<FacilityResponse>> {
    const name = payload.name || payload.nome;
    if (!name || !name.trim()) {
      throw new BadRequestException('O nome da unidade pública é obrigatório.');
    }

    const type = toPrismaTipoPredio(payload.type || payload.tipo);
    const address = payload.address || payload.endereco || 'Endereço não informado';
    const setor = payload.setor?.trim() || 'ADMINISTRACAO';
    const porte = payload.porte?.trim()?.toUpperCase() || 'MEDIO';
    const capacidade = payload.capacidade ? Number(payload.capacidade) : null;
    const latitude = payload.latitude !== undefined ? Number(payload.latitude) : null;
    const longitude = payload.longitude !== undefined ? Number(payload.longitude) : null;

    let gestorId = payload.gestorId || payload.gestor_id;
    if (!gestorId) {
      const defaultGestor = await this.prisma.usuario.findFirst({
        where: { role: 'GESTOR' },
      });
      gestorId = defaultGestor?.id;
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const predio = await tx.predio.create({
        data: {
          nome: name.trim(),
          tipo: type,
          setor,
          porte,
          capacidade,
          endereco: address.trim(),
          latitude,
          longitude,
          ativo: true,
          gestor_id: gestorId,
        },
        include: {
          gestor: true,
          ordens_servico: true,
        },
      });

      // PostGIS: Sincronizar geometria Point se latitude e longitude existirem
      if (latitude !== null && longitude !== null) {
        await tx.$executeRawUnsafe(
          `UPDATE predios SET coordenadas = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3`,
          longitude,
          latitude,
          predio.id,
        );
      }

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'Predio',
            entidade_id: predio.id,
            acao: AuditAction.CREATE,
            usuario_id: currentUser.id,
            dados_novos: {
              nome: predio.nome,
              tipo: predio.tipo,
              setor: predio.setor,
              latitude: predio.latitude,
              longitude: predio.longitude,
            },
          },
        });
      }

      return predio;
    });

    return {
      success: true,
      data: this.mapFacility(created),
      message: 'Unidade predial criada com sucesso.',
    };
  }

  async update(id: string, payload: UpdateFacilityDto, currentUser?: any): Promise<ApiResponse<FacilityResponse>> {
    const target = await this.prisma.predio.findUnique({
      where: { id },
      include: { gestor: true, ordens_servico: true },
    });

    if (!target) {
      throw new NotFoundException(`Unidade predial ${id} não encontrada.`);
    }

    const updateData: any = {};
    if (payload.name || payload.nome) updateData.nome = (payload.name || payload.nome)?.trim();
    if (payload.type || payload.tipo) updateData.tipo = toPrismaTipoPredio(payload.type || payload.tipo);
    if (payload.setor !== undefined) updateData.setor = payload.setor?.trim() || 'ADMINISTRACAO';
    if (payload.porte !== undefined) updateData.porte = payload.porte?.trim()?.toUpperCase() || 'MEDIO';
    if (payload.capacidade !== undefined) updateData.capacidade = payload.capacidade ? Number(payload.capacidade) : null;
    if (payload.address || payload.endereco) updateData.endereco = (payload.address || payload.endereco)?.trim();
    if (payload.latitude !== undefined) updateData.latitude = payload.latitude !== null ? Number(payload.latitude) : null;
    if (payload.longitude !== undefined) updateData.longitude = payload.longitude !== null ? Number(payload.longitude) : null;
    if (payload.gestorId || payload.gestor_id) updateData.gestor_id = payload.gestorId || payload.gestor_id;

    // Regra de desativação (Tribunal de Contas / Preservação Fiscal)
    if (payload.ativo !== undefined) {
      if (payload.ativo === false && target.ativo !== false) {
        const motivo = payload.motivoDesativacao || payload.motivo_desativacao;
        if (!motivo || !motivo.trim()) {
          throw new BadRequestException(
            'A justificativa da desativação predial é obrigatória para fins de auditoria pública e Tribunal de Contas.',
          );
        }
        updateData.ativo = false;
        updateData.motivo_desativacao = motivo.trim();
      } else if (payload.ativo === true) {
        updateData.ativo = true;
        updateData.motivo_desativacao = null;
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const predio = await tx.predio.update({
        where: { id },
        data: updateData,
        include: {
          gestor: true,
          ordens_servico: true,
        },
      });

      // PostGIS: Sincronizar geometria se houver alteração de coordenadas
      if (updateData.latitude !== undefined || updateData.longitude !== undefined) {
        const lat = predio.latitude;
        const lon = predio.longitude;
        if (lat !== null && lon !== null) {
          await tx.$executeRawUnsafe(
            `UPDATE predios SET coordenadas = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3`,
            lon,
            lat,
            predio.id,
          );
        } else {
          await tx.$executeRawUnsafe(
            `UPDATE predios SET coordenadas = NULL WHERE id = $1`,
            predio.id,
          );
        }
      }

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'Predio',
            entidade_id: predio.id,
            acao: AuditAction.UPDATE,
            usuario_id: currentUser.id,
            dados_antigos: {
              nome: target.nome,
              ativo: target.ativo,
              tipo: target.tipo,
              motivo_desativacao: target.motivo_desativacao,
            },
            dados_novos: {
              nome: predio.nome,
              ativo: predio.ativo,
              tipo: predio.tipo,
              motivo_desativacao: predio.motivo_desativacao,
            },
          },
        });
      }

      return predio;
    });

    return {
      success: true,
      data: this.mapFacility(updated),
      message: 'Unidade predial atualizada com sucesso.',
    };
  }

  async remove(id: string, currentUser?: any): Promise<ApiResponse<{ id: string; deleted: boolean }>> {
    const target = await this.prisma.predio.findUnique({
      where: { id },
      include: {
        ordens_servico: true,
      },
    });

    if (!target) {
      throw new NotFoundException(`Unidade predial ${id} não encontrada.`);
    }

    // Regra estrita do Tribunal de Contas: Se houver histórico de OS, proibir hard delete
    if (target.ordens_servico && target.ordens_servico.length > 0) {
      throw new BadRequestException(
        `Não é permitido excluir uma unidade com histórico de Ordens de Serviço vinculadas (${target.ordens_servico.length} chamados registrados). Exigência fiscal do Tribunal de Contas: desative a unidade alterando seu status para DESATIVADO.`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.predio.delete({
        where: { id },
      });

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'Predio',
            entidade_id: id,
            acao: AuditAction.DELETE,
            usuario_id: currentUser.id,
            dados_antigos: {
              nome: target.nome,
              tipo: target.tipo,
              endereco: target.endereco,
            },
          },
        });
      }
    });

    return {
      success: true,
      data: { id, deleted: true },
      message: 'Unidade predial excluída com sucesso.',
    };
  }
}

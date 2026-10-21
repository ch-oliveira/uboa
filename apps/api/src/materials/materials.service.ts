import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';
import type { CreateMaterialDto } from './dto/create-material.dto.js';
import type { UpdateMaterialDto } from './dto/update-material.dto.js';
import { AuditAction } from '@repo/database';

export interface MaterialResponse {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  unidadeMedida: string;
  precoUnitario: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: boolean;
  alertaEstoque: boolean;
  prefeituraId?: string;
  criadoEm: string;
}

@Injectable()
export class MaterialsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapMaterial(m: any): MaterialResponse {
    const estoqueAtual = Number(m.estoque_atual || 0);
    const estoqueMinimo = Number(m.estoque_minimo || 0);
    return {
      id: m.id,
      codigo: m.codigo,
      nome: m.nome,
      categoria: m.categoria || 'GERAL',
      unidadeMedida: m.unidade_medida || 'UN',
      precoUnitario: Number(m.preco_unitario || 0),
      estoqueAtual,
      estoqueMinimo,
      ativo: m.ativo !== false,
      alertaEstoque: estoqueAtual <= estoqueMinimo,
      prefeituraId: m.prefeitura_id || undefined,
      criadoEm: m.criado_em.toISOString(),
    };
  }

  async findAll(
    filter?: { categoria?: string; search?: string; alertaEstoque?: boolean },
    currentUser?: any,
  ): Promise<ApiResponse<MaterialResponse[]>> {
    const where: any = { ativo: true };

    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    if (filter?.categoria && filter.categoria !== 'TODAS') {
      where.categoria = filter.categoria.toUpperCase();
    }

    if (filter?.search?.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { nome: { contains: q, mode: 'insensitive' } },
        { codigo: { contains: q, mode: 'insensitive' } },
      ];
    }

    const items = await this.prisma.material.findMany({
      where,
      orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
    });

    let mapped = items.map((m: any) => this.mapMaterial(m));

    if (filter?.alertaEstoque) {
      mapped = mapped.filter((m) => m.alertaEstoque);
    }

    return {
      success: true,
      data: mapped,
      meta: {
        total: mapped.length,
      },
    };
  }

  async findOne(id: string): Promise<ApiResponse<MaterialResponse>> {
    const m = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!m) throw new NotFoundException('Material não encontrado.');

    return {
      success: true,
      data: this.mapMaterial(m),
    };
  }

  async create(dto: CreateMaterialDto, currentUser?: any): Promise<ApiResponse<MaterialResponse>> {
    const prefeituraId = currentUser?.prefeituraId || 'prefeitura-default';
    const codigoClean = dto.codigo.trim().toUpperCase();

    const existing = await this.prisma.material.findFirst({
      where: {
        prefeitura_id: prefeituraId,
        codigo: codigoClean,
      },
    });

    if (existing) {
      throw new ConflictException(`Já existe um material com o código ${codigoClean} nesta prefeitura.`);
    }

    const m = await this.prisma.material.create({
      data: {
        codigo: codigoClean,
        nome: dto.nome.trim(),
        categoria: dto.categoria?.trim()?.toUpperCase() || 'GERAL',
        unidade_medida: dto.unidadeMedida?.trim()?.toUpperCase() || 'UN',
        preco_unitario: dto.precoUnitario,
        estoque_atual: dto.estoqueAtual ?? 0,
        estoque_minimo: dto.estoqueMinimo ?? 5,
        ativo: true,
        prefeitura_id: prefeituraId,
      },
    });

    if (currentUser?.id) {
      await this.prisma.auditoriaLog.create({
        data: {
          entidade_afetada: 'Material',
          entidade_id: m.id,
          acao: AuditAction.CREATE,
          usuario_id: currentUser.id,
          prefeitura_id: prefeituraId,
          dados_novos: { codigo: m.codigo, nome: m.nome, preco: m.preco_unitario },
        },
      });
    }

    return {
      success: true,
      data: this.mapMaterial(m),
      message: 'Material cadastrado com sucesso no catálogo municipal.',
    };
  }

  async update(id: string, dto: UpdateMaterialDto, currentUser?: any): Promise<ApiResponse<MaterialResponse>> {
    const existing = await this.prisma.material.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Material não encontrado.');

    const data: any = {};
    if (dto.codigo !== undefined) data.codigo = dto.codigo.trim().toUpperCase();
    if (dto.nome !== undefined) data.nome = dto.nome.trim();
    if (dto.categoria !== undefined) data.categoria = dto.categoria.trim().toUpperCase();
    if (dto.unidadeMedida !== undefined) data.unidade_medida = dto.unidadeMedida.trim().toUpperCase();
    if (dto.precoUnitario !== undefined) data.preco_unitario = dto.precoUnitario;
    if (dto.estoqueAtual !== undefined) data.estoque_atual = dto.estoqueAtual;
    if (dto.estoqueMinimo !== undefined) data.estoque_minimo = dto.estoqueMinimo;
    if (dto.ativo !== undefined) data.ativo = dto.ativo;

    const updated = await this.prisma.material.update({
      where: { id },
      data,
    });

    if (currentUser?.id) {
      await this.prisma.auditoriaLog.create({
        data: {
          entidade_afetada: 'Material',
          entidade_id: id,
          acao: AuditAction.UPDATE,
          usuario_id: currentUser.id,
          prefeitura_id: existing.prefeitura_id,
          dados_antigos: { preco: existing.preco_unitario, estoque: existing.estoque_atual },
          dados_novos: data,
        },
      });
    }

    return {
      success: true,
      data: this.mapMaterial(updated),
      message: 'Material atualizado com sucesso.',
    };
  }

  async delete(id: string, currentUser?: any): Promise<ApiResponse<null>> {
    const existing = await this.prisma.material.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Material não encontrado.');

    // Soft delete
    await this.prisma.material.update({
      where: { id },
      data: { ativo: false },
    });

    if (currentUser?.id) {
      await this.prisma.auditoriaLog.create({
        data: {
          entidade_afetada: 'Material',
          entidade_id: id,
          acao: AuditAction.DELETE,
          usuario_id: currentUser.id,
          prefeitura_id: existing.prefeitura_id,
          dados_novos: { status: 'DESATIVADO' },
        },
      });
    }

    return {
      success: true,
      data: null,
      message: 'Material desativado com sucesso.',
    };
  }
}

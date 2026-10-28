import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditAction, StatusOS } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';
import type { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto.js';

export interface AssetResponse {
  id: string;
  codigoPatrimonio: string;
  nome: string;
  categoria: string;
  ambiente: string;
  marcaModelo?: string;
  numeroSerie?: string;
  status: string;
  dataInstalacao?: string;
  garantiaAte?: string;
  ultimaManutencao?: string;
  custoAcumulado: number;
  totalChamados: number;
  chamadosAbertos: number;
  emGarantia: boolean;
  alertaSubstituicao: boolean;
  recomendacaoTce: string;
  qrCodeUrl: string;
  ativo: boolean;
  predioId: string;
  predioNome: string;
  predioTipo?: string;
  prefeituraId?: string;
  criadoEm: string;
}

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapAsset(a: any): AssetResponse {
    const ordensValidas = (a.ordens_servico || []).filter(
      (o: any) => o.status !== StatusOS.CANCELADO,
    );
    const chamadosAbertos = ordensValidas.filter(
      (o: any) => o.status !== StatusOS.CONCLUIDO,
    ).length;
    const totalChamados = ordensValidas.length;

    const somaCustosOS = ordensValidas.reduce(
      (acc: number, curr: any) => acc + Number(curr.custo_total || 0),
      0,
    );
    const custoAcumulado = Math.max(Number(a.custo_acumulado || 0), somaCustosOS);

    const emGarantia = Boolean(
      a.garantia_ate && new Date(a.garantia_ate).getTime() > Date.now(),
    );
    const alertaSubstituicao = totalChamados >= 3 || a.status === 'CRITICO';

    let recomendacaoTce = 'Operação regular dentro dos parâmetros de vida útil.';
    if (emGarantia) {
      recomendacaoTce =
        'Equipamento em período de garantia vigente. Acionar assistência técnica autorizada sem ônus ao contrato de manutenção.';
    } else if (alertaSubstituicao) {
      recomendacaoTce =
        'Alerta de antieconomicidade (TCE): Equipamento acumula 3+ ocorrências corretivas ou estado crítico. Recomendada avaliação técnica para substituição patrimonial.';
    }

    const predioNome = a.predio?.nome || 'Unidade Municipal';
    const qrParams = new URLSearchParams({
      unidade: predioNome,
      setor: a.ambiente || 'Geral',
      patrimonio: a.codigo_patrimonio,
      ativo: a.nome,
      categoria: a.categoria || 'GERAL',
    });

    return {
      id: a.id,
      codigoPatrimonio: a.codigo_patrimonio,
      nome: a.nome,
      categoria: a.categoria || 'GERAL',
      ambiente: a.ambiente,
      marcaModelo: a.marca_modelo || undefined,
      numeroSerie: a.numero_serie || undefined,
      status: a.status || 'OPERACIONAL',
      dataInstalacao: a.data_instalacao ? a.data_instalacao.toISOString() : undefined,
      garantiaAte: a.garantia_ate ? a.garantia_ate.toISOString() : undefined,
      ultimaManutencao: a.ultima_manutencao ? a.ultima_manutencao.toISOString() : undefined,
      custoAcumulado: Number(custoAcumulado.toFixed(2)),
      totalChamados,
      chamadosAbertos,
      emGarantia,
      alertaSubstituicao,
      recomendacaoTce,
      qrCodeUrl: `/abrir-chamado?${qrParams.toString()}`,
      ativo: a.ativo !== false,
      predioId: a.predio_id,
      predioNome,
      predioTipo: a.predio?.tipo || undefined,
      prefeituraId: a.prefeitura_id || undefined,
      criadoEm: a.criado_em ? a.criado_em.toISOString() : new Date().toISOString(),
    };
  }

  async findAll(
    filter?: {
      facilityId?: string;
      predioNome?: string;
      categoria?: string;
      status?: string;
      search?: string;
    },
    currentUser?: any,
  ): Promise<ApiResponse<AssetResponse[]>> {
    const where: any = { ativo: true };

    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    if (filter?.facilityId) {
      where.predio_id = filter.facilityId;
    } else if (filter?.predioNome) {
      where.predio = {
        nome: { contains: filter.predioNome.trim(), mode: 'insensitive' },
      };
    }

    if (filter?.categoria && filter.categoria !== 'TODOS' && filter.categoria !== 'TODAS') {
      where.categoria = filter.categoria.trim().toUpperCase();
    }

    if (filter?.status && filter.status !== 'TODOS') {
      where.status = filter.status.trim().toUpperCase();
    }

    if (filter?.search?.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { nome: { contains: q, mode: 'insensitive' } },
        { codigo_patrimonio: { contains: q, mode: 'insensitive' } },
        { ambiente: { contains: q, mode: 'insensitive' } },
      ];
    }

    const items = await this.prisma.ativoPredial.findMany({
      where,
      include: {
        predio: { select: { id: true, nome: true, tipo: true } },
        ordens_servico: { select: { id: true, status: true, custo_total: true } },
      },
      orderBy: [{ ambiente: 'asc' }, { nome: 'asc' }],
    });

    const mapped = items.map((a: any) => this.mapAsset(a));

    return {
      success: true,
      data: mapped,
      meta: {
        total: mapped.length,
        criticosCount: mapped.filter((m) => m.alertaSubstituicao).length,
        emGarantiaCount: mapped.filter((m) => m.emGarantia).length,
      },
    };
  }

  async findOne(id: string, currentUser?: any): Promise<ApiResponse<AssetResponse>> {
    const item = await this.prisma.ativoPredial.findUnique({
      where: { id },
      include: {
        predio: { select: { id: true, nome: true, tipo: true } },
        ordens_servico: {
          select: { id: true, codigo: true, titulo: true, status: true, custo_total: true, criado_em: true },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Ativo predial "${id}" não encontrado.`);
    }

    if (
      currentUser?.prefeituraId &&
      item.prefeitura_id &&
      item.prefeitura_id !== currentUser.prefeituraId
    ) {
      throw new ForbiddenException('Acesso negado. Este equipamento pertence a outra prefeitura.');
    }

    return {
      success: true,
      data: this.mapAsset(item),
    };
  }

  async findByQrCode(code: string): Promise<ApiResponse<AssetResponse>> {
    const clean = code?.trim();
    if (!clean) {
      throw new BadRequestException('Código de patrimônio ou QR Code inválido.');
    }

    const item = await this.prisma.ativoPredial.findFirst({
      where: {
        ativo: true,
        OR: [
          { codigo_patrimonio: { equals: clean, mode: 'insensitive' } },
          { id: clean },
        ],
      },
      include: {
        predio: { select: { id: true, nome: true, tipo: true } },
        ordens_servico: { select: { id: true, status: true, custo_total: true } },
      },
    });

    if (!item) {
      throw new NotFoundException(`Equipamento com código "${clean}" não localizado.`);
    }

    return {
      success: true,
      data: this.mapAsset(item),
    };
  }

  async create(dto: CreateAssetDto, currentUser?: any): Promise<ApiResponse<AssetResponse>> {
    const codigoClean = dto.codigoPatrimonio?.trim().toUpperCase();
    const nomeClean = dto.nome?.trim();
    const ambienteClean = dto.ambiente?.trim();

    if (!codigoClean || !nomeClean || !ambienteClean) {
      throw new BadRequestException(
        'Código de patrimônio, nome do equipamento e ambiente instalado são obrigatórios.',
      );
    }

    const prefeituraId = currentUser?.prefeituraId || 'prefeitura-default';

    const existing = await this.prisma.ativoPredial.findFirst({
      where: {
        prefeitura_id: prefeituraId,
        codigo_patrimonio: codigoClean,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Já existe um equipamento cadastrado com o patrimônio "${codigoClean}" nesta prefeitura.`,
      );
    }

    const predio = await this.prisma.predio.findFirst({
      where: {
        OR: [
          { id: dto.predioId },
          { nome: { equals: dto.predioId, mode: 'insensitive' } },
        ],
      },
    });

    if (!predio) {
      throw new NotFoundException(`Unidade predial "${dto.predioId}" não encontrada.`);
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const item = await tx.ativoPredial.create({
        data: {
          codigo_patrimonio: codigoClean,
          nome: nomeClean,
          categoria: dto.categoria?.trim().toUpperCase() || 'CLIMATIZACAO',
          ambiente: ambienteClean,
          marca_modelo: dto.marcaModelo?.trim() || null,
          numero_serie: dto.numeroSerie?.trim() || null,
          status: dto.status?.trim().toUpperCase() || 'OPERACIONAL',
          data_instalacao: dto.dataInstalacao ? new Date(dto.dataInstalacao) : null,
          garantia_ate: dto.garantiaAte ? new Date(dto.garantiaAte) : null,
          predio_id: predio.id,
          prefeitura_id: prefeituraId,
        },
        include: {
          predio: { select: { id: true, nome: true, tipo: true } },
          ordens_servico: { select: { id: true, status: true, custo_total: true } },
        },
      });

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'AtivoPredial',
            entidade_id: item.id,
            acao: AuditAction.CREATE,
            usuario_id: currentUser.id,
            prefeitura_id: prefeituraId,
            dados_novos: {
              codigo_patrimonio: item.codigo_patrimonio,
              nome: item.nome,
              ambiente: item.ambiente,
              predio_id: item.predio_id,
            },
          },
        });
      }

      return item;
    });

    return {
      success: true,
      data: this.mapAsset(created),
      message: 'Equipamento e etiqueta QR Code registrados com sucesso na unidade.',
    };
  }

  async update(
    id: string,
    dto: UpdateAssetDto,
    currentUser?: any,
  ): Promise<ApiResponse<AssetResponse>> {
    const existing = await this.prisma.ativoPredial.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Equipamento "${id}" não encontrado.`);
    }

    if (
      currentUser?.prefeituraId &&
      existing.prefeitura_id &&
      existing.prefeitura_id !== currentUser.prefeituraId
    ) {
      throw new ForbiddenException('Acesso negado. Este equipamento pertence a outra prefeitura.');
    }

    const updateData: any = {};
    if (dto.nome !== undefined) updateData.nome = dto.nome.trim();
    if (dto.categoria !== undefined) updateData.categoria = dto.categoria.trim().toUpperCase();
    if (dto.ambiente !== undefined) updateData.ambiente = dto.ambiente.trim();
    if (dto.marcaModelo !== undefined) updateData.marca_modelo = dto.marcaModelo.trim() || null;
    if (dto.numeroSerie !== undefined) updateData.numero_serie = dto.numeroSerie.trim() || null;
    if (dto.status !== undefined) updateData.status = dto.status.trim().toUpperCase();
    if (dto.garantiaAte !== undefined) {
      updateData.garantia_ate = dto.garantiaAte ? new Date(dto.garantiaAte) : null;
    }
    if (dto.custoAcumulado !== undefined) updateData.custo_acumulado = dto.custoAcumulado;
    if (dto.ativo !== undefined) updateData.ativo = dto.ativo;

    const updated = await this.prisma.$transaction(async (tx) => {
      const item = await tx.ativoPredial.update({
        where: { id },
        data: updateData,
        include: {
          predio: { select: { id: true, nome: true, tipo: true } },
          ordens_servico: { select: { id: true, status: true, custo_total: true } },
        },
      });

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'AtivoPredial',
            entidade_id: id,
            acao: AuditAction.UPDATE,
            usuario_id: currentUser.id,
            prefeitura_id: existing.prefeitura_id,
            dados_antigos: { status: existing.status, ambiente: existing.ambiente },
            dados_novos: updateData,
          },
        });
      }

      return item;
    });

    return {
      success: true,
      data: this.mapAsset(updated),
      message: 'Equipamento atualizado com sucesso.',
    };
  }

  async remove(id: string, currentUser?: any): Promise<ApiResponse<null>> {
    const existing = await this.prisma.ativoPredial.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Equipamento "${id}" não encontrado.`);
    }

    if (
      currentUser?.prefeituraId &&
      existing.prefeitura_id &&
      existing.prefeitura_id !== currentUser.prefeituraId
    ) {
      throw new ForbiddenException('Acesso negado. Este equipamento pertence a outra prefeitura.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.ativoPredial.update({
        where: { id },
        data: { ativo: false, status: 'INATIVO' },
      });

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'AtivoPredial',
            entidade_id: id,
            acao: AuditAction.DELETE,
            usuario_id: currentUser.id,
            prefeitura_id: existing.prefeitura_id,
            dados_novos: { ativo: false, status: 'INATIVO' },
          },
        });
      }
    });

    return {
      success: true,
      data: null,
      message: 'Equipamento desativado preservando histórico patrimonial.',
    };
  }
}


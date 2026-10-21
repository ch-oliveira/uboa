import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';
import type { CreateContractDto } from './dto/create-contract.dto.js';
import type { UpdateContractDto } from './dto/update-contract.dto.js';
import { AuditAction } from '@repo/database';

export interface ContractResponse {
  id: string;
  numeroContrato: string;
  numeroEmpenho: string;
  empresaContratada: string;
  cnpjContratada?: string;
  objeto?: string;
  categoriaPadrao: string;
  valorTotalEmpenhado: number;
  valorTotalMedido: number;
  saldoRestante: number;
  percentualExecutado: number;
  vigenciaInicio?: string;
  vigenciaFim?: string;
  ativo: boolean;
  ordensCount: number;
  prefeituraId?: string;
  criadoEm: string;
}

@Injectable()
export class ContractsService {
  constructor(private readonly prisma: PrismaService) {}

  private mapContract(c: any, totalMedido: number = 0, ordensCount: number = 0): ContractResponse {
    const empenhado = Number(c.valor_total_empenhado || 0);
    const medido = Number(totalMedido || 0);
    const saldo = Math.max(0, empenhado - medido);
    const percentual = empenhado > 0 ? Math.min(100, (medido / empenhado) * 100) : 0;

    return {
      id: c.id,
      numeroContrato: c.numero_contrato,
      numeroEmpenho: c.numero_empenho,
      empresaContratada: c.empresa_contratada,
      cnpjContratada: c.cnpj_contratada || undefined,
      objeto: c.objeto || undefined,
      categoriaPadrao: c.categoria_padrao || 'GERAL',
      valorTotalEmpenhado: empenhado,
      valorTotalMedido: medido,
      saldoRestante: saldo,
      percentualExecutado: Number(percentual.toFixed(2)),
      vigenciaInicio: c.vigencia_inicio ? c.vigencia_inicio.toISOString() : undefined,
      vigenciaFim: c.vigencia_fim ? c.vigencia_fim.toISOString() : undefined,
      ativo: c.ativo !== false,
      ordensCount,
      prefeituraId: c.prefeitura_id || undefined,
      criadoEm: c.criado_em.toISOString(),
    };
  }

  async findAll(currentUser?: any): Promise<ApiResponse<ContractResponse[]>> {
    const where: any = { ativo: true };

    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const contracts = await this.prisma.contratoManutencao.findMany({
      where,
      orderBy: { criado_em: 'desc' },
      include: {
        ordens_servico: {
          select: {
            id: true,
            custo_total: true,
          },
        },
      },
    });

    const mapped = contracts.map((c) => {
      const medido = (c.ordens_servico || []).reduce(
        (acc: number, curr: any) => acc + Number(curr.custo_total || 0),
        0,
      );
      return this.mapContract(c, medido, (c.ordens_servico || []).length);
    });

    return {
      success: true,
      data: mapped,
    };
  }

  async findOne(id: string, currentUser?: any): Promise<ApiResponse<ContractResponse & { ordens: any[] }>> {
    const where: any = { id };
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const c = await this.prisma.contratoManutencao.findFirst({
      where,
      include: {
        ordens_servico: {
          select: {
            id: true,
            codigo: true,
            titulo: true,
            status: true,
            custo_materiais: true,
            custo_mao_de_obra: true,
            custo_total: true,
            criado_em: true,
            predio: { select: { nome: true } },
          },
        },
      },
    });

    if (!c) {
      throw new NotFoundException(`Contrato com ID "${id}" não encontrado.`);
    }

    const medido = (c.ordens_servico || []).reduce(
      (acc: number, curr: any) => acc + Number(curr.custo_total || 0),
      0,
    );

    const mapped = this.mapContract(c, medido, (c.ordens_servico || []).length);

    return {
      success: true,
      data: {
        ...mapped,
        ordens: (c.ordens_servico || []).map((o: any) => ({
          id: o.id,
          codigo: o.codigo,
          titulo: o.titulo,
          status: o.status,
          predioNome: o.predio?.nome || 'Unidade Municipal',
          custoMateriais: Number(o.custo_materiais || 0),
          custoMaoDeObra: Number(o.custo_mao_de_obra || 0),
          custoTotal: Number(o.custo_total || 0),
          criadoEm: o.criado_em.toISOString(),
        })),
      },
    };
  }

  async create(dto: CreateContractDto, currentUser?: any): Promise<ApiResponse<ContractResponse>> {
    const prefeituraId = currentUser?.prefeituraId;

    if (prefeituraId) {
      const existing = await this.prisma.contratoManutencao.findFirst({
        where: {
          prefeitura_id: prefeituraId,
          numero_contrato: dto.numeroContrato.trim(),
        },
      });
      if (existing) {
        throw new ConflictException(
          `Já existe um contrato cadastrado com o número "${dto.numeroContrato}".`,
        );
      }
    }

    const created = await this.prisma.contratoManutencao.create({
      data: {
        numero_contrato: dto.numeroContrato.trim(),
        numero_empenho: dto.numeroEmpenho.trim(),
        empresa_contratada: dto.empresaContratada.trim(),
        cnpj_contratada: dto.cnpjContratada?.trim() || null,
        objeto: dto.objeto?.trim() || null,
        categoria_padrao: dto.categoriaPadrao?.trim().toUpperCase() || 'GERAL',
        valor_total_empenhado: dto.valorTotalEmpenhado,
        vigencia_inicio: dto.vigenciaInicio ? new Date(dto.vigenciaInicio) : null,
        vigencia_fim: dto.vigenciaFim ? new Date(dto.vigenciaFim) : null,
        prefeitura_id: prefeituraId || null,
      },
    });

    if (currentUser?.id) {
      await this.prisma.auditoriaLog.create({
        data: {
          entidade_afetada: 'contratos_manutencao',
          entidade_id: created.id,
          acao: AuditAction.CREATE,
          usuario_id: currentUser.id,
          prefeitura_id: prefeituraId || null,
          dados_novos: {
            numero_contrato: created.numero_contrato,
            empresa_contratada: created.empresa_contratada,
            valor_total_empenhado: Number(created.valor_total_empenhado),
          },
        },
      });
    }

    return {
      success: true,
      data: this.mapContract(created, 0, 0),
      message: 'Contrato de manutenção e empenho cadastrados com sucesso.',
    };
  }

  async update(id: string, dto: UpdateContractDto, currentUser?: any): Promise<ApiResponse<ContractResponse>> {
    const where: any = { id };
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const existing = await this.prisma.contratoManutencao.findFirst({ where });
    if (!existing) {
      throw new NotFoundException(`Contrato com ID "${id}" não encontrado.`);
    }

    const updated = await this.prisma.contratoManutencao.update({
      where: { id },
      data: {
        numero_contrato: dto.numeroContrato?.trim() || undefined,
        numero_empenho: dto.numeroEmpenho?.trim() || undefined,
        empresa_contratada: dto.empresaContratada?.trim() || undefined,
        cnpj_contratada: dto.cnpjContratada !== undefined ? dto.cnpjContratada?.trim() || null : undefined,
        objeto: dto.objeto !== undefined ? dto.objeto?.trim() || null : undefined,
        categoria_padrao: dto.categoriaPadrao ? dto.categoriaPadrao.trim().toUpperCase() : undefined,
        valor_total_empenhado: dto.valorTotalEmpenhado !== undefined ? dto.valorTotalEmpenhado : undefined,
        vigencia_inicio: dto.vigenciaInicio ? new Date(dto.vigenciaInicio) : undefined,
        vigencia_fim: dto.vigenciaFim ? new Date(dto.vigenciaFim) : undefined,
        ativo: dto.ativo !== undefined ? dto.ativo : undefined,
      },
      include: {
        ordens_servico: {
          select: { id: true, custo_total: true },
        },
      },
    });

    const medido = (updated.ordens_servico || []).reduce(
      (acc: number, curr: any) => acc + Number(curr.custo_total || 0),
      0,
    );

    return {
      success: true,
      data: this.mapContract(updated, medido, (updated.ordens_servico || []).length),
      message: 'Contrato atualizado com sucesso.',
    };
  }

  async remove(id: string, currentUser?: any): Promise<ApiResponse<null>> {
    const where: any = { id };
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const existing = await this.prisma.contratoManutencao.findFirst({ where });
    if (!existing) {
      throw new NotFoundException(`Contrato com ID "${id}" não encontrado.`);
    }

    await this.prisma.contratoManutencao.update({
      where: { id },
      data: { ativo: false },
    });

    return {
      success: true,
      data: null,
      message: 'Contrato desativado com sucesso.',
    };
  }
}

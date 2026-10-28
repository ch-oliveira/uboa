import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';
import type { CreateContractDto } from './dto/create-contract.dto.js';
import type { UpdateContractDto } from './dto/update-contract.dto.js';
import type { CreateBoletimDto, PreviewBoletimQueryDto } from './dto/boletim-medicao.dto.js';
import { AuditAction, StatusOS } from '@repo/database';

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
  bdiPadrao?: number;
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
      bdiPadrao: Number(c.bdi_padrao || 20.00),
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
            status: true,
          },
        },
      },
    });

    const mapped = contracts.map((c) => {
      const ordensValidas = (c.ordens_servico || []).filter(
        (curr: any) => curr.status !== StatusOS.CANCELADO,
      );
      const medido = ordensValidas.reduce(
        (acc: number, curr: any) => acc + Number(curr.custo_total || 0),
        0,
      );
      return this.mapContract(c, medido, ordensValidas.length);
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

    const ordensValidas = (c.ordens_servico || []).filter(
      (curr: any) => curr.status !== StatusOS.CANCELADO,
    );
    const medido = ordensValidas.reduce(
      (acc: number, curr: any) => acc + Number(curr.custo_total || 0),
      0,
    );

    const mapped = this.mapContract(c, medido, ordensValidas.length);

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
          select: { id: true, custo_total: true, status: true },
        },
      },
    });

    const ordensValidas = (updated.ordens_servico || []).filter(
      (curr: any) => curr.status !== StatusOS.CANCELADO,
    );
    const medido = ordensValidas.reduce(
      (acc: number, curr: any) => acc + Number(curr.custo_total || 0),
      0,
    );

    return {
      success: true,
      data: this.mapContract(updated, medido, ordensValidas.length),
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

  /**
   * Pré-visualiza a consolidação mensal de medição para um contrato.
   * Regra rígida (Lei 14.133/21 & TCE):
   * Apenas ordens com status CONCLUIDO e com atesto digital do diretor da unidade APROVADO
   * entram na medição fiscal e no cálculo do BDI.
   */
  async previewBoletim(
    contratoId: string,
    params: PreviewBoletimQueryDto,
    currentUser?: any,
  ): Promise<ApiResponse<any>> {
    const where: any = { id: contratoId };
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const contract = await this.prisma.contratoManutencao.findFirst({
      where,
      include: {
        ordens_servico: {
          include: {
            predio: true,
            materiais_consumidos: true,
            atestado_por: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contrato com ID "${contratoId}" não encontrado.`);
    }

    const mes = Number(params.mes || new Date().getMonth() + 1);
    const ano = Number(params.ano || new Date().getFullYear());
    const inicio = params.dataInicio ? new Date(params.dataInicio) : new Date(ano, mes - 1, 1, 0, 0, 0);
    const fim = params.dataFim ? new Date(params.dataFim) : new Date(ano, mes, 0, 23, 59, 59, 999);

    const ordensValidas = (contract.ordens_servico || []).filter((o: any) => {
      if (o.status === StatusOS.CANCELADO) return false;
      if (o.boletim_medicao_id) return false;
      if (o.status !== StatusOS.CONCLUIDO) return false;
      if (o.concluido_em) {
        const d = new Date(o.concluido_em);
        if (d < inicio || d > fim) return false;
      }
      return true;
    });

    const ordensAprovadas = ordensValidas.filter((o: any) => o.status_atesto === 'APROVADO');
    const ordensPendentes = ordensValidas.filter((o: any) => o.status_atesto !== 'APROVADO');

    const valorMateriais = Number(
      ordensAprovadas.reduce((acc: number, curr: any) => acc + Number(curr.custo_materiais || 0), 0).toFixed(2),
    );
    const valorMaoDeObra = Number(
      ordensAprovadas.reduce((acc: number, curr: any) => acc + Number(curr.custo_mao_de_obra || 0), 0).toFixed(2),
    );
    const valorDireto = Number((valorMateriais + valorMaoDeObra).toFixed(2));
    const bdiPercentual = Number(params.bdiPercentual ?? contract.bdi_padrao ?? 20.0);
    const valorBdi = Number(((valorDireto * bdiPercentual) / 100).toFixed(2));
    const valorTotal = Number((valorDireto + valorBdi).toFixed(2));

    // Consolidado de Itens de Materiais / Peças (SINAPI)
    const itensConsolidados: Record<string, { descricao: string; quantidade: number; unidadeMedida: string; precoUnitario: number; precoTotal: number }> = {};
    for (const o of ordensAprovadas) {
      for (const m of o.materiais_consumidos || []) {
        const key = `${m.descricao}|${m.unidade_medida || 'UN'}|${Number(m.preco_unitario || 0)}`;
        if (!itensConsolidados[key]) {
          itensConsolidados[key] = {
            descricao: m.descricao,
            quantidade: 0,
            unidadeMedida: m.unidade_medida || 'UN',
            precoUnitario: Number(m.preco_unitario || 0),
            precoTotal: 0,
          };
        }
        itensConsolidados[key].quantidade += Number(m.quantidade || 0);
        itensConsolidados[key].precoTotal = Number(
          (itensConsolidados[key].quantidade * itensConsolidados[key].precoUnitario).toFixed(2),
        );
      }
    }

    const valorTotalEmpenhado = Number(contract.valor_total_empenhado || 0);
    const ordensContratoTotais = (contract.ordens_servico || []).filter((o: any) => o.status !== StatusOS.CANCELADO);
    const jaMedido = ordensContratoTotais
      .filter((o: any) => o.boletim_medicao_id)
      .reduce((acc: number, curr: any) => acc + Number(curr.custo_total || 0), 0);
    const saldoRemanescente = Math.max(0, valorTotalEmpenhado - jaMedido - valorTotal);

    return {
      success: true,
      data: {
        contratoId: contract.id,
        numeroContrato: contract.numero_contrato,
        numeroEmpenho: contract.numero_empenho,
        empresaContratada: contract.empresa_contratada,
        cnpjContratada: contract.cnpj_contratada,
        mesCompetencia: mes,
        anoCompetencia: ano,
        dataInicio: inicio.toISOString(),
        dataFim: fim.toISOString(),
        valorTotalEmpenhado,
        valorJaMedido: jaMedido,
        valorMateriais,
        valorMaoDeObra,
        valorDireto,
        bdiPercentual,
        valorBdi,
        valorTotal,
        saldoRemanescenteAposBoletim: saldoRemanescente,
        ordensAprovadasCount: ordensAprovadas.length,
        ordensPendentesCount: ordensPendentes.length,
        ordensAprovadas: ordensAprovadas.map((o: any) => ({
          id: o.id,
          codigo: o.codigo,
          titulo: o.titulo,
          predioNome: o.predio?.nome || 'Unidade Municipal',
          custoMateriais: Number(o.custo_materiais || 0),
          custoMaoDeObra: Number(o.custo_mao_de_obra || 0),
          custoTotal: Number(o.custo_total || 0),
          atestadoPorNome: o.atestado_por?.nome,
          parecerAtesto: o.parecer_atesto,
          concluidoEm: o.concluido_em ? o.concluido_em.toISOString() : undefined,
          assinaturaHash: o.assinatura_digital_hash,
        })),
        ordensPendentesAtesto: ordensPendentes.map((o: any) => ({
          id: o.id,
          codigo: o.codigo,
          titulo: o.titulo,
          predioNome: o.predio?.nome || 'Unidade Municipal',
          statusAtesto: o.status_atesto || 'PENDENTE',
          custoTotal: Number(o.custo_total || 0),
        })),
        materiaisConsolidados: Object.values(itensConsolidados),
      },
    };
  }

  /**
   * Consolida oficialmente e trava o Boletim de Medição Mensal no banco de dados,
   * vinculando as ordens aprovadas, gerando o hash SHA-256 de integridade fiscal e
   * gravando log de auditoria para o Tribunal de Contas.
   */
  async createBoletim(
    contratoId: string,
    dto: CreateBoletimDto,
    currentUser: any,
  ): Promise<ApiResponse<any>> {
    const where: any = { id: contratoId };
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const contract = await this.prisma.contratoManutencao.findFirst({
      where,
      include: {
        ordens_servico: {
          include: {
            predio: true,
            materiais_consumidos: true,
          },
        },
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contrato com ID "${contratoId}" não encontrado.`);
    }

    const mes = Number(dto.mesCompetencia);
    const ano = Number(dto.anoCompetencia);
    const inicio = dto.dataInicio ? new Date(dto.dataInicio) : new Date(ano, mes - 1, 1, 0, 0, 0);
    const fim = dto.dataFim ? new Date(dto.dataFim) : new Date(ano, mes, 0, 23, 59, 59, 999);

    const ordensAprovadas = (contract.ordens_servico || []).filter((o: any) => {
      if (o.status === StatusOS.CANCELADO) return false;
      if (o.boletim_medicao_id) return false;
      if (o.status !== StatusOS.CONCLUIDO) return false;
      if (o.status_atesto !== 'APROVADO') return false;
      if (o.concluido_em) {
        const d = new Date(o.concluido_em);
        if (d < inicio || d > fim) return false;
      }
      return true;
    });

    if (ordensAprovadas.length === 0) {
      throw new BadRequestException(
        'Não existem ordens de serviço concluídas e com atesto digital aprovado para este período.',
      );
    }

    const valorMateriais = Number(
      ordensAprovadas.reduce((acc: number, curr: any) => acc + Number(curr.custo_materiais || 0), 0).toFixed(2),
    );
    const valorMaoDeObra = Number(
      ordensAprovadas.reduce((acc: number, curr: any) => acc + Number(curr.custo_mao_de_obra || 0), 0).toFixed(2),
    );
    const valorDireto = Number((valorMateriais + valorMaoDeObra).toFixed(2));
    const bdiPct = Number(dto.bdiPercentual ?? contract.bdi_padrao ?? 20.0);
    const valorBdi = Number(((valorDireto * bdiPct) / 100).toFixed(2));
    const valorTotal = Number((valorDireto + valorBdi).toFixed(2));

    const totalBoletinsCount = await this.prisma.boletimMedicao.count({
      where: {
        prefeitura_id: contract.prefeitura_id || undefined,
        ano_competencia: ano,
      },
    });

    const numeroBoletim = `BM-${ano}-${String(totalBoletinsCount + 1).padStart(3, '0')}`;
    const hashContent = `${numeroBoletim}|${contratoId}|${valorTotal}|${mes}/${ano}|${ordensAprovadas.map((o: any) => o.id).sort().join(',')}|${currentUser?.id || 'fiscal'}`;
    const hashIntegridade = createHash('sha256').update(hashContent).digest('hex');

    const created = await this.prisma.$transaction(async (tx) => {
      const bm = await tx.boletimMedicao.create({
        data: {
          numero_boletim: numeroBoletim,
          mes_competencia: mes,
          ano_competencia: ano,
          data_inicio: inicio,
          data_fim: fim,
          status: 'APROVADO',
          bdi_percentual: bdiPct,
          valor_materiais: valorMateriais,
          valor_mao_de_obra: valorMaoDeObra,
          valor_direto: valorDireto,
          valor_bdi: valorBdi,
          valor_total: valorTotal,
          observacoes: dto.observacoes?.trim() || null,
          hash_integridade: hashIntegridade,
          fiscal_responsavel_id: currentUser?.id || null,
          contrato_id: contratoId,
          prefeitura_id: contract.prefeitura_id || currentUser?.prefeituraId || null,
        },
      });

      await tx.ordemServico.updateMany({
        where: { id: { in: ordensAprovadas.map((o: any) => o.id) } },
        data: { boletim_medicao_id: bm.id },
      });

      if (currentUser?.id) {
        await tx.auditoriaLog.create({
          data: {
            entidade_afetada: 'boletins_medicao',
            entidade_id: bm.id,
            acao: AuditAction.CREATE,
            usuario_id: currentUser.id,
            prefeitura_id: contract.prefeitura_id || currentUser?.prefeituraId || null,
            dados_novos: {
              numero_boletim: bm.numero_boletim,
              mes: bm.mes_competencia,
              ano: bm.ano_competencia,
              valor_total: Number(bm.valor_total),
              ordens_count: ordensAprovadas.length,
              hash_integridade: hashIntegridade,
            },
          },
        });
      }

      return bm;
    });

    return {
      success: true,
      data: {
        id: created.id,
        numeroBoletim: created.numero_boletim,
        mesCompetencia: created.mes_competencia,
        anoCompetencia: created.ano_competencia,
        dataInicio: created.data_inicio ? created.data_inicio.toISOString() : inicio.toISOString(),
        dataFim: created.data_fim ? created.data_fim.toISOString() : fim.toISOString(),
        valorMateriais: Number(created.valor_materiais),
        valorMaoDeObra: Number(created.valor_mao_de_obra),
        valorDireto: Number(created.valor_direto),
        bdiPercentual: Number(created.bdi_percentual),
        valorBdi: Number(created.valor_bdi),
        valorTotal: Number(created.valor_total),
        status: created.status,
        hashIntegridade: created.hash_integridade,
        ordensMedidasCount: ordensAprovadas.length,
      },
      message: `Boletim de Medição ${created.numero_boletim} consolidado com sucesso com BDI de ${bdiPct}%.`,
    };
  }

  async findAllBoletins(contratoId?: string, currentUser?: any): Promise<ApiResponse<any[]>> {
    const where: any = {};
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }
    if (contratoId) {
      where.contrato_id = contratoId;
    }

    const boletins = await this.prisma.boletimMedicao.findMany({
      where,
      orderBy: [{ ano_competencia: 'desc' }, { mes_competencia: 'desc' }, { criado_em: 'desc' }],
      include: {
        contrato: {
          select: {
            id: true,
            numero_contrato: true,
            empresa_contratada: true,
            numero_empenho: true,
          },
        },
        fiscal_responsavel: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        _count: {
          select: {
            ordens_servico: true,
          },
        },
      },
    });

    return {
      success: true,
      data: boletins.map((b: any) => ({
        id: b.id,
        numeroBoletim: b.numero_boletim,
        mesCompetencia: b.mes_competencia,
        anoCompetencia: b.ano_competencia,
        dataInicio: b.data_inicio.toISOString(),
        dataFim: b.data_fim.toISOString(),
        status: b.status,
        bdiPercentual: Number(b.bdi_percentual),
        valorMateriais: Number(b.valor_materiais),
        valorMaoDeObra: Number(b.valor_mao_de_obra),
        valorDireto: Number(b.valor_direto),
        valorBdi: Number(b.valor_bdi),
        valorTotal: Number(b.valor_total),
        hashIntegridade: b.hash_integridade,
        contrato: b.contrato,
        fiscalResponsavel: b.fiscal_responsavel,
        ordensCount: b._count?.ordens_servico || 0,
        criadoEm: b.criado_em.toISOString(),
      })),
    };
  }

  async findBoletimById(id: string, currentUser?: any): Promise<ApiResponse<any>> {
    const where: any = { id };
    if (currentUser?.prefeituraId) {
      where.prefeitura_id = currentUser.prefeituraId;
    }

    const bm = await this.prisma.boletimMedicao.findFirst({
      where,
      include: {
        contrato: true,
        fiscal_responsavel: {
          select: { id: true, nome: true, email: true },
        },
        ordens_servico: {
          include: {
            predio: true,
            atestado_por: { select: { id: true, nome: true } },
            materiais_consumidos: true,
          },
        },
      },
    });

    if (!bm) {
      throw new NotFoundException(`Boletim de medição "${id}" não encontrado.`);
    }

    return {
      success: true,
      data: {
        id: bm.id,
        numeroBoletim: bm.numero_boletim,
        mesCompetencia: bm.mes_competencia,
        anoCompetencia: bm.ano_competencia,
        dataInicio: bm.data_inicio.toISOString(),
        dataFim: bm.data_fim.toISOString(),
        status: bm.status,
        bdiPercentual: Number(bm.bdi_percentual),
        valorMateriais: Number(bm.valor_materiais),
        valorMaoDeObra: Number(bm.valor_mao_de_obra),
        valorDireto: Number(bm.valor_direto),
        valorBdi: Number(bm.valor_bdi),
        valorTotal: Number(bm.valor_total),
        observacoes: bm.observacoes,
        hashIntegridade: bm.hash_integridade,
        fiscalResponsavel: bm.fiscal_responsavel,
        contrato: {
          id: bm.contrato.id,
          numeroContrato: bm.contrato.numero_contrato,
          numeroEmpenho: bm.contrato.numero_empenho,
          empresaContratada: bm.contrato.empresa_contratada,
          cnpjContratada: bm.contrato.cnpj_contratada,
          valorTotalEmpenhado: Number(bm.contrato.valor_total_empenhado),
        },
        ordensServico: bm.ordens_servico.map((o: any) => ({
          id: o.id,
          codigo: o.codigo,
          titulo: o.titulo,
          predioNome: o.predio?.nome || 'Unidade Municipal',
          custoMateriais: Number(o.custo_materiais || 0),
          custoMaoDeObra: Number(o.custo_mao_de_obra || 0),
          custoTotal: Number(o.custo_total || 0),
          concluidoEm: o.concluido_em ? o.concluido_em.toISOString() : undefined,
          atestadoPorNome: o.atestado_por?.nome,
          parecerAtesto: o.parecer_atesto,
          assinaturaHash: o.assinatura_digital_hash,
          materiais: (o.materiais_consumidos || []).map((m: any) => ({
            descricao: m.descricao,
            quantidade: Number(m.quantidade || 0),
            unidadeMedida: m.unidade_medida || 'UN',
            precoUnitario: Number(m.preco_unitario || 0),
            precoTotal: Number(m.preco_total || 0),
          })),
        })),
        criadoEm: bm.criado_em.toISOString(),
      },
    };
  }
}

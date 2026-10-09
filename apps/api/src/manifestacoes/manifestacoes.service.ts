import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role, StatusManifestacao, TipoManifestacao, AuditAction } from '@repo/database';
import { CreateManifestacaoDto, ResponderManifestacaoDto, ConverterManifestacaoOsDto } from './dto/manifestacao.dto.js';

export interface ManifestacaoResponse {
  id: string;
  protocolo: string;
  tipo: TipoManifestacao;
  categoria: string;
  descricao: string;
  predioId?: string | null;
  predioNome?: string | null;
  predioTipo?: string | null;
  predioEndereco?: string | null;
  localReferencia?: string | null;
  bairro?: string | null;
  anonimo: boolean;
  manifestanteNome?: string | null;
  manifestanteEmail?: string | null;
  manifestanteTelefone?: string | null;
  status: StatusManifestacao;
  respostaOficial?: string | null;
  respondidoEm?: string | null;
  respondidoPorNome?: string | null;
  motivoArquivamento?: string | null;
  ordemServicoId?: string | null;
  ordemServicoCodigo?: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PublicManifestacaoTrack {
  protocolo: string;
  tipo: TipoManifestacao;
  categoria: string;
  descricao: string;
  localReferencia?: string | null;
  bairro?: string | null;
  predio?: {
    nome: string;
    tipo: string;
    endereco: string;
  } | null;
  status: StatusManifestacao;
  respostaOficial?: string | null;
  respondidoEm?: string | null;
  ordemServicoCodigo?: string | null;
  criadoEm: string;
}

@Injectable()
export class ManifestacoesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registro público de manifestação ou reclamação cidadã
   */
  async create(dto: CreateManifestacaoDto) {
    let predio = null;
    if (dto.predioId) {
      predio = await this.prisma.predio.findUnique({
        where: { id: dto.predioId },
      });

      if (!predio) {
        throw new NotFoundException(`Unidade pública não encontrada com ID: ${dto.predioId}`);
      }
    }

    const protocolo = `OUV-${Math.floor(100000 + Math.random() * 900000)}`;

    const manifestacao = await this.prisma.manifestacao.create({
      data: {
        protocolo,
        tipo: dto.tipo || TipoManifestacao.RECLAMACAO,
        categoria: (dto.categoria || 'GERAL').trim().toUpperCase(),
        descricao: dto.descricao.trim(),
        predio_id: predio ? predio.id : null,
        local_referencia: dto.localReferencia?.trim() || null,
        bairro: dto.bairro?.trim() || null,
        anonimo: dto.anonimo ?? false,
        manifestante_nome: dto.anonimo ? null : (dto.nome?.trim() || null),
        manifestante_email: dto.anonimo ? null : (dto.email?.trim() || null),
        manifestante_telefone: dto.anonimo ? null : (dto.telefone?.trim() || null),
        status: StatusManifestacao.RECEBIDA,
      },
      include: {
        predio: true,
      },
    });

    return {
      success: true,
      protocolo: manifestacao.protocolo,
      message: 'Sua manifestação foi registrada com sucesso e encaminhada à ouvidoria municipal.',
      data: this.mapToResponse(manifestacao),
    };
  }

  /**
   * Consulta pública de acompanhamento por código de protocolo (OUV-XXXXXX)
   */
  async trackPublic(protocolo: string): Promise<{ success: boolean; data: PublicManifestacaoTrack }> {
    const cleanProtocol = (protocolo || '').trim().toUpperCase();

    const manifestacao = await this.prisma.manifestacao.findUnique({
      where: { protocolo: cleanProtocol },
      include: {
        predio: true,
        ordem_servico: {
          select: { codigo: true },
        },
      },
    });

    if (!manifestacao) {
      throw new NotFoundException(`Manifestação com protocolo "${cleanProtocol}" não foi encontrada.`);
    }

    return {
      success: true,
      data: {
        protocolo: manifestacao.protocolo,
        tipo: manifestacao.tipo,
        categoria: manifestacao.categoria,
        descricao: manifestacao.descricao,
        localReferencia: manifestacao.local_referencia || null,
        bairro: manifestacao.bairro || null,
        predio: manifestacao.predio
          ? {
              nome: manifestacao.predio.nome,
              tipo: manifestacao.predio.tipo,
              endereco: manifestacao.predio.endereco,
            }
          : null,
        status: manifestacao.status,
        respostaOficial: manifestacao.resposta_oficial,
        respondidoEm: manifestacao.respondido_em ? manifestacao.respondido_em.toISOString() : null,
        ordemServicoCodigo: manifestacao.ordem_servico?.codigo || null,
        criadoEm: manifestacao.criado_em.toISOString(),
      },
    };
  }

  /**
   * Listagem de manifestações para a gestão municipal
   */
  async findAll(
    filters: {
      predioId?: string;
      status?: StatusManifestacao;
      tipo?: TipoManifestacao;
      categoria?: string;
      busca?: string;
    },
    user?: any,
  ) {
    if (user?.role === Role.TECNICO) {
      throw new ForbiddenException('Técnicos de campo não possuem acesso ao módulo de ouvidoria.');
    }

    const where: any = {};

    // Isolamento de solicitante (ex: diretor de escola vê apenas da sua escola)
    if (user?.role === Role.SOLICITANTE && user?.predio) {
      where.predio = { nome: user.predio };
    } else if (filters.predioId) {
      if (filters.predioId === 'GERAL' || filters.predioId === 'SEM_PREDIO') {
        where.predio_id = null;
      } else {
        where.predio_id = filters.predioId;
      }
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.tipo) {
      where.tipo = filters.tipo;
    }

    if (filters.categoria) {
      where.categoria = filters.categoria.toUpperCase();
    }

    if (filters.busca) {
      const search = filters.busca.trim();
      where.OR = [
        { protocolo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
        { manifestante_nome: { contains: search, mode: 'insensitive' } },
        { local_referencia: { contains: search, mode: 'insensitive' } },
        { bairro: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, totalCount, recebidasCount, respondidasCount, arquivadasCount, convertidasCount] =
      await Promise.all([
        this.prisma.manifestacao.findMany({
          where,
          include: {
            predio: true,
            respondido_por: { select: { id: true, nome: true, email: true } },
            ordem_servico: { select: { id: true, codigo: true, titulo: true, status: true } },
          },
          orderBy: { criado_em: 'desc' },
        }),
        this.prisma.manifestacao.count({ where }),
        this.prisma.manifestacao.count({ where: { ...where, status: StatusManifestacao.RECEBIDA } }),
        this.prisma.manifestacao.count({ where: { ...where, status: StatusManifestacao.RESPONDIDA } }),
        this.prisma.manifestacao.count({ where: { ...where, status: StatusManifestacao.ARQUIVADA } }),
        this.prisma.manifestacao.count({ where: { ...where, status: StatusManifestacao.CONVERTIDA_EM_OS } }),
      ]);

    return {
      success: true,
      data: items.map((item) => this.mapToResponse(item)),
      meta: {
        totalCount,
        recebidasCount,
        respondidasCount,
        arquivadasCount,
        convertidasCount,
        pendentesCount: recebidasCount,
      },
    };
  }

  /**
   * Detalhes de uma manifestação específica
   */
  async findOne(id: string, user?: any) {
    if (user?.role === Role.TECNICO) {
      throw new ForbiddenException('Técnicos de campo não possuem acesso ao módulo de ouvidoria.');
    }

    const item = await this.prisma.manifestacao.findUnique({
      where: { id },
      include: {
        predio: true,
        respondido_por: { select: { id: true, nome: true, email: true } },
        ordem_servico: { select: { id: true, codigo: true, titulo: true, status: true } },
      },
    });

    if (!item) {
      throw new NotFoundException(`Manifestação com ID "${id}" não encontrada.`);
    }

    // Solicitante só pode ver de seu próprio prédio
    if (user?.role === Role.SOLICITANTE && user?.predio && item.predio?.nome !== user.predio) {
      throw new ForbiddenException('Acesso não autorizado aos dados de outra unidade pública.');
    }

    return {
      success: true,
      data: this.mapToResponse(item),
    };
  }

  /**
   * Resposta oficial ou arquivamento pelo Gestor Municipal
   */
  async responder(id: string, dto: ResponderManifestacaoDto, user: any) {
    if (!user || (user.role !== Role.GESTOR && user.role !== Role.ADMIN)) {
      throw new ForbiddenException('Apenas gestores ou administradores podem emitir parecer oficial de ouvidoria.');
    }

    const item = await this.prisma.manifestacao.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Manifestação com ID "${id}" não encontrada.`);
    }

    const novoStatus = dto.acao === 'ARQUIVAR' ? StatusManifestacao.ARQUIVADA : StatusManifestacao.RESPONDIDA;

    return this.prisma.$transaction(async (tx) => {
      const atualizado = await tx.manifestacao.update({
        where: { id },
        data: {
          resposta_oficial: dto.resposta.trim(),
          respondido_por_id: user.id,
          respondido_em: new Date(),
          status: novoStatus,
          motivo_arquivamento: dto.acao === 'ARQUIVAR' ? (dto.motivoArquivamento?.trim() || 'Arquivado após análise') : null,
        },
        include: {
          predio: true,
          respondido_por: { select: { id: true, nome: true, email: true } },
          ordem_servico: { select: { id: true, codigo: true, titulo: true, status: true } },
        },
      });

      await tx.auditoriaLog.create({
        data: {
          entidade_afetada: 'Manifestacao',
          entidade_id: id,
          acao: AuditAction.UPDATE,
          usuario_id: user.id,
          dados_antigos: { status: item.status, resposta_oficial: item.resposta_oficial } as any,
          dados_novos: { status: novoStatus, resposta_oficial: atualizado.resposta_oficial } as any,
        },
      });

      return {
        success: true,
        message: dto.acao === 'ARQUIVAR' ? 'Manifestação arquivada com sucesso.' : 'Resposta oficial registrada com sucesso.',
        data: this.mapToResponse(atualizado),
      };
    });
  }

  /**
   * Converte uma manifestação em uma Ordem de Serviço técnica
   */
  async converterEmOS(id: string, dto: ConverterManifestacaoOsDto, user: any) {
    if (!user || (user.role !== Role.GESTOR && user.role !== Role.ADMIN)) {
      throw new ForbiddenException('Apenas gestores podem converter manifestações em ordens de serviço.');
    }

    const manifestacao = await this.prisma.manifestacao.findUnique({
      where: { id },
      include: { predio: true },
    });

    if (!manifestacao) {
      throw new NotFoundException(`Manifestação com ID "${id}" não encontrada.`);
    }

    if (manifestacao.status === StatusManifestacao.CONVERTIDA_EM_OS && manifestacao.ordem_servico_id) {
      throw new BadRequestException('Esta manifestação já foi convertida em chamado técnico anteriormente.');
    }

    const osCodigo = `OS-${Math.floor(100000 + Math.random() * 900000)}`;

    let destinoPredioId = dto.predioId || manifestacao.predio_id;
    if (!destinoPredioId) {
      const predioPadrao = await this.prisma.predio.findFirst({
        where: { ativo: true },
        orderBy: { criado_em: 'asc' },
      });
      if (!predioPadrao) {
        throw new BadRequestException('Para converter esta manifestação em Ordem de Serviço, informe o prédio/unidade técnica responsável.');
      }
      destinoPredioId = predioPadrao.id;
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Cria a Ordem de Serviço técnica vinculada
      const localDesc = manifestacao.local_referencia || manifestacao.predio?.nome || 'Via Pública / Serviços Gerais';
      const novaOS = await tx.ordemServico.create({
        data: {
          codigo: osCodigo,
          titulo: dto.titulo?.trim() || `Demanda Técnica oriunda de Ouvidoria (${manifestacao.protocolo})`,
          descricao: `Origem: Ouvidoria [${manifestacao.protocolo}] - Local: ${localDesc} - Relato do cidadão: "${manifestacao.descricao}"`,
          categoria: dto.categoria?.toUpperCase() || 'GERAL',
          prioridade: dto.prioridade || 'MEDIA',
          predio_id: destinoPredioId,
          solicitante_id: user.id, // O próprio gestor autua a OS
        },
      });

      // 2. Atualiza a Manifestação
      const atualizada = await tx.manifestacao.update({
        where: { id },
        data: {
          status: StatusManifestacao.CONVERTIDA_EM_OS,
          ordem_servico_id: novaOS.id,
          resposta_oficial: `Identificamos necessidade de intervenção física. Foi gerada a Ordem de Serviço técnica nº ${novaOS.codigo} para atendimento por nossas equipes de zeladoria.`,
          respondido_por_id: user.id,
          respondido_em: new Date(),
        },
        include: {
          predio: true,
          respondido_por: { select: { id: true, nome: true, email: true } },
          ordem_servico: { select: { id: true, codigo: true, titulo: true, status: true } },
        },
      });

      // 3. Auditoria
      await tx.auditoriaLog.create({
        data: {
          entidade_afetada: 'Manifestacao',
          entidade_id: id,
          acao: AuditAction.UPDATE,
          usuario_id: user.id,
          dados_antigos: { status: manifestacao.status } as any,
          dados_novos: { status: StatusManifestacao.CONVERTIDA_EM_OS, ordem_servico_id: novaOS.id, os_codigo: novaOS.codigo } as any,
        },
      });

      return {
        success: true,
        message: `Manifestação convertida com sucesso! Ordem de Serviço ${novaOS.codigo} criada.`,
        data: {
          manifestacao: this.mapToResponse(atualizada),
          ordemServico: {
            id: novaOS.id,
            codigo: novaOS.codigo,
            titulo: novaOS.titulo,
            status: novaOS.status,
          },
        },
      };
    });
  }

  private mapToResponse(item: any): ManifestacaoResponse {
    let predioNome = 'Geral / Serviços Urbanos';
    if (item.predio?.nome) {
      predioNome = item.predio.nome;
    } else if (item.bairro) {
      predioNome = `Geral (${item.bairro})`;
    }

    return {
      id: item.id,
      protocolo: item.protocolo,
      tipo: item.tipo,
      categoria: item.categoria,
      descricao: item.descricao,
      predioId: item.predio_id || null,
      predioNome,
      predioTipo: item.predio?.tipo || null,
      predioEndereco: item.predio?.endereco || item.local_referencia || null,
      localReferencia: item.local_referencia || null,
      bairro: item.bairro || null,
      anonimo: item.anonimo,
      manifestanteNome: item.anonimo ? null : item.manifestante_nome,
      manifestanteEmail: item.anonimo ? null : item.manifestante_email,
      manifestanteTelefone: item.anonimo ? null : item.manifestante_telefone,
      status: item.status,
      respostaOficial: item.resposta_oficial,
      respondidoEm: item.respondido_em ? item.respondido_em.toISOString() : null,
      respondidoPorNome: item.respondido_por?.nome || null,
      motivoArquivamento: item.motivo_arquivamento,
      ordemServicoId: item.ordem_servico_id || item.ordem_servico?.id || null,
      ordemServicoCodigo: item.ordem_servico?.codigo || null,
      criadoEm: item.criado_em.toISOString(),
      atualizadoEm: item.atualizado.toISOString(),
    };
  }
}

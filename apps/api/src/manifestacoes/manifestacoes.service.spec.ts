import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ManifestacoesService } from './manifestacoes.service.js';
import { Role, StatusManifestacao, TipoManifestacao, AuditAction } from '@repo/database';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('ManifestacoesService - Gestão de Ouvidoria e Reclamações Cidadãs', () => {
  let service: ManifestacoesService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      predio: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
      },
      manifestacao: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        update: vi.fn(),
      },
      ordemServico: {
        create: vi.fn(),
      },
      auditoriaLog: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(prismaMock)),
    };

    service = new ManifestacoesService(prismaMock);
  });

  describe('Criação Pública de Manifestações (create)', () => {
    it('deve registrar com sucesso uma reclamação gerando protocolo OUV-XXXXXX', async () => {
      const predio = {
        id: 'predio-1',
        nome: 'EMEF Paulo Freire',
        tipo: 'ESCOLA',
        endereco: 'Rua das Flores, 123',
      };
      prismaMock.predio.findUnique.mockResolvedValue(predio);
      prismaMock.predio.findFirst.mockResolvedValue(predio);

      const fakeCreated = {
        id: 'manif-1',
        protocolo: 'OUV-849201',
        tipo: TipoManifestacao.RECLAMACAO,
        categoria: 'ATENDIMENTO',
        descricao: 'Demora excessiva e falta de informação na recepção da escola.',
        predio_id: 'predio-1',
        predio,
        anonimo: false,
        manifestante_nome: 'Cidadão Silva',
        manifestante_email: 'silva@email.com',
        manifestante_telefone: '(11) 98765-4321',
        status: StatusManifestacao.RECEBIDA,
        resposta_oficial: null,
        respondido_em: null,
        motivo_arquivamento: null,
        ordem_servico_id: null,
        criado_em: new Date('2026-10-08T10:00:00Z'),
        atualizado: new Date('2026-10-08T10:00:00Z'),
      };
      prismaMock.manifestacao.create.mockResolvedValue(fakeCreated);

      const res = await service.create({
        predioId: 'predio-1',
        tipo: TipoManifestacao.RECLAMACAO,
        categoria: 'Atendimento',
        descricao: 'Demora excessiva e falta de informação na recepção da escola.',
        anonimo: false,
        nome: 'Cidadão Silva',
        email: 'silva@email.com',
        telefone: '(11) 98765-4321',
      });

      expect(res.success).toBe(true);
      expect(res.protocolo).toBe('OUV-849201');
      expect(res.data.status).toBe(StatusManifestacao.RECEBIDA);
      expect(prismaMock.manifestacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            predio_id: 'predio-1',
            categoria: 'ATENDIMENTO',
            status: StatusManifestacao.RECEBIDA,
          }),
        }),
      );
    });

    it('deve registrar manifestação geral do município ou via pública sem predioId', async () => {
      const fakeCreated = {
        id: 'manif-geral-1',
        protocolo: 'OUV-112233',
        tipo: TipoManifestacao.RECLAMACAO,
        categoria: 'SERVICOS_URBANOS',
        descricao: 'Buraco de grande porte na via pública causando risco de acidentes.',
        predio_id: null,
        predio: null,
        local_referencia: 'Av. Brasil, altura do nº 1500',
        bairro: 'Centro',
        anonimo: false,
        manifestante_nome: 'Maria Cidadã',
        manifestante_email: 'maria@email.com',
        manifestante_telefone: null,
        status: StatusManifestacao.RECEBIDA,
        resposta_oficial: null,
        respondido_em: null,
        motivo_arquivamento: null,
        ordem_servico_id: null,
        criado_em: new Date('2026-10-08T10:00:00Z'),
        atualizado: new Date('2026-10-08T10:00:00Z'),
      };
      prismaMock.manifestacao.create.mockResolvedValue(fakeCreated);

      const res = await service.create({
        tipo: TipoManifestacao.RECLAMACAO,
        categoria: 'SERVICOS_URBANOS',
        descricao: 'Buraco de grande porte na via pública causando risco de acidentes.',
        localReferencia: 'Av. Brasil, altura do nº 1500',
        bairro: 'Centro',
        anonimo: false,
        nome: 'Maria Cidadã',
        email: 'maria@email.com',
      });

      expect(res.success).toBe(true);
      expect(res.protocolo).toBe('OUV-112233');
      expect(res.data.predioId).toBeNull();
      expect(res.data.predioNome).toBe('Geral (Centro)');
      expect(res.data.localReferencia).toBe('Av. Brasil, altura do nº 1500');
      expect(prismaMock.manifestacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            predio_id: null,
            local_referencia: 'Av. Brasil, altura do nº 1500',
            bairro: 'Centro',
          }),
        }),
      );
    });

    it('deve registrar com fallback para local_referencia se a unidade indicada não constar no catálogo', async () => {
      prismaMock.predio.findFirst.mockResolvedValue(null);
      prismaMock.manifestacao.create.mockResolvedValue({
        id: 'manif-fallback',
        protocolo: 'OUV-999999',
        tipo: TipoManifestacao.RECLAMACAO,
        categoria: 'GERAL',
        descricao: 'Reclamação sobre atendimento geral.',
        predio_id: null,
        predio: null,
        local_referencia: 'Unidade indicada: Unidade Desconhecida',
        bairro: null,
        anonimo: false,
        manifestante_nome: null,
        manifestante_email: null,
        manifestante_telefone: null,
        status: StatusManifestacao.RECEBIDA,
        resposta_oficial: null,
        respondido_em: null,
        motivo_arquivamento: null,
        ordem_servico_id: null,
        criado_em: new Date('2026-10-08T10:00:00Z'),
        atualizado: new Date('2026-10-08T10:00:00Z'),
      });

      const res = await service.create({
        predioId: 'Unidade Desconhecida',
        descricao: 'Reclamação sobre atendimento geral.',
      });

      expect(res.success).toBe(true);
      expect(prismaMock.manifestacao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            predio_id: null,
            local_referencia: 'Unidade indicada: Unidade Desconhecida',
          }),
        }),
      );
    });
  });

  describe('Consulta Pública por Protocolo (trackPublic)', () => {
    it('deve retornar os dados públicos higienizados pelo protocolo OUV', async () => {
      const fake = {
        protocolo: 'OUV-123456',
        tipo: TipoManifestacao.RECLAMACAO,
        categoria: 'RUÍDO',
        descricao: 'Muito barulho no entorno da unidade.',
        predio: { nome: 'UBS Vila Nova', tipo: 'UBS', endereco: 'Av. Central 50' },
        status: StatusManifestacao.RESPONDIDA,
        resposta_oficial: 'Entramos em contato com a fiscalização e providências foram tomadas.',
        respondido_em: new Date('2026-10-08T14:00:00Z'),
        ordem_servico: null,
        criado_em: new Date('2026-10-08T09:00:00Z'),
      };
      prismaMock.manifestacao.findUnique.mockResolvedValue(fake);

      const res = await service.trackPublic('ouv-123456');

      expect(res.success).toBe(true);
      expect(res.data.protocolo).toBe('OUV-123456');
      expect(res.data.status).toBe(StatusManifestacao.RESPONDIDA);
      expect(res.data.respostaOficial).toBe('Entramos em contato com a fiscalização e providências foram tomadas.');
    });

    it('deve lançar NotFoundException se o protocolo não existir', async () => {
      prismaMock.manifestacao.findUnique.mockResolvedValue(null);

      await expect(service.trackPublic('OUV-999999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Listagem e Controle de Acesso (findAll)', () => {
    it('deve impedir técnicos de campo de acessar o módulo de ouvidoria', async () => {
      const tecnicoUser = { id: 'tec-1', role: Role.TECNICO };

      await expect(service.findAll({}, tecnicoUser)).rejects.toThrow(ForbiddenException);
    });

    it('deve listar manifestações e métricas para o Gestor', async () => {
      const gestorUser = { id: 'ges-1', role: Role.GESTOR };
      prismaMock.manifestacao.findMany.mockResolvedValue([
        {
          id: 'm-1',
          protocolo: 'OUV-100',
          tipo: TipoManifestacao.RECLAMACAO,
          categoria: 'LIMPEZA',
          descricao: 'Falta de material de higiene',
          predio: { nome: 'Escola 1' },
          status: StatusManifestacao.RECEBIDA,
          criado_em: new Date(),
          atualizado: new Date(),
        },
      ]);
      prismaMock.manifestacao.count.mockResolvedValueOnce(1); // total
      prismaMock.manifestacao.count.mockResolvedValueOnce(1); // recebidas
      prismaMock.manifestacao.count.mockResolvedValueOnce(0); // respondidas
      prismaMock.manifestacao.count.mockResolvedValueOnce(0); // arquivadas
      prismaMock.manifestacao.count.mockResolvedValueOnce(0); // convertidas

      const res = await service.findAll({}, gestorUser);

      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(1);
      expect(res.meta.totalCount).toBe(1);
      expect(res.meta.recebidasCount).toBe(1);
    });
  });

  describe('Resposta Oficial e Parecer (responder)', () => {
    it('deve atualizar para RESPONDIDA e registrar log de auditoria fiscal', async () => {
      const gestor = { id: 'gestor-1', role: Role.GESTOR };
      const existing = {
        id: 'm-1',
        status: StatusManifestacao.RECEBIDA,
        resposta_oficial: null,
      };
      prismaMock.manifestacao.findUnique.mockResolvedValue(existing);
      prismaMock.manifestacao.update.mockResolvedValue({
        ...existing,
        status: StatusManifestacao.RESPONDIDA,
        resposta_oficial: 'Parecer técnico emitido e resolvido.',
        respondido_em: new Date(),
        respondido_por: { nome: 'Mariana Alves' },
        predio: { nome: 'EMEF Paulo Freire' },
        criado_em: new Date(),
        atualizado: new Date(),
      });

      const res = await service.responder(
        'm-1',
        { resposta: 'Parecer técnico emitido e resolvido.', acao: 'RESPONDER' },
        gestor,
      );

      expect(res.success).toBe(true);
      expect(res.data.status).toBe(StatusManifestacao.RESPONDIDA);
      expect(prismaMock.auditoriaLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            entidade_afetada: 'Manifestacao',
            acao: AuditAction.UPDATE,
            usuario_id: gestor.id,
          }),
        }),
      );
    });
  });

  describe('Conversão em Chamado Técnico (converterEmOS)', () => {
    it('deve criar uma Ordem de Serviço física vinculada e atualizar a manifestação para CONVERTIDA_EM_OS', async () => {
      const gestor = { id: 'gestor-1', role: Role.GESTOR };
      const manifestacao = {
        id: 'm-1',
        protocolo: 'OUV-555555',
        descricao: 'Lâmpada do corredor queimada e oferecendo risco.',
        predio_id: 'predio-1',
        status: StatusManifestacao.RECEBIDA,
        predio: { id: 'predio-1', nome: 'Escola Central' },
      };

      prismaMock.manifestacao.findUnique.mockResolvedValue(manifestacao);
      prismaMock.ordemServico.create.mockResolvedValue({
        id: 'os-novo-id',
        codigo: 'OS-901234',
        titulo: 'Demanda Técnica oriunda de Ouvidoria (OUV-555555)',
        status: 'RECEBIDO',
      });
      prismaMock.manifestacao.update.mockResolvedValue({
        ...manifestacao,
        status: StatusManifestacao.CONVERTIDA_EM_OS,
        ordem_servico_id: 'os-novo-id',
        resposta_oficial: 'Identificamos necessidade de intervenção física...',
        criado_em: new Date(),
        atualizado: new Date(),
      });

      const res = await service.converterEmOS(
        'm-1',
        { categoria: 'ELETRICA', prioridade: 'ALTA' },
        gestor,
      );

      expect(res.success).toBe(true);
      expect(res.data.ordemServico.codigo).toBe('OS-901234');
      expect(prismaMock.ordemServico.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            predio_id: 'predio-1',
            solicitante_id: gestor.id,
            categoria: 'ELETRICA',
            prioridade: 'ALTA',
          }),
        }),
      );
      expect(prismaMock.auditoriaLog.create).toHaveBeenCalled();
    });
  });
});

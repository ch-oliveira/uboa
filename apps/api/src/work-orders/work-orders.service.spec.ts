import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersService } from './work-orders.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusOS, Prioridade, Role, AuditAction } from '@repo/database';
import { BadRequestException, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';

describe('WorkOrdersService - Ciclo de Vida da OS', () => {
  let service: WorkOrdersService;

  const mockPrismaService = {
    ordemServico: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    agendaVistoria: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    predio: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    usuario: {
      findFirst: vi.fn(),
    },
    configuracaoSistema: {
      findFirst: vi.fn().mockResolvedValue({
        sla_urgente_h: 4,
        sla_alta_h: 24,
        sla_media_h: 72,
        sla_baixa_h: 168,
      }),
    },
    auditoriaLog: {
      create: vi.fn(),
    },
    contratoManutencao: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      return callback({
        ordemServico: mockPrismaService.ordemServico,
        auditoriaLog: mockPrismaService.auditoriaLog,
      });
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  it('deve rejeitar mutação em ordens com status terminal CONCLUIDO', async () => {
    mockPrismaService.ordemServico.findFirst.mockResolvedValue({
      id: 'os-1',
      codigo: 'OS-100001',
      status: StatusOS.CONCLUIDO,
      prioridade: Prioridade.MEDIA,
      fotos_conclusao: ['https://exemplo.com/depois.jpg'],
      criado_em: new Date(),
    });

    await expect(
      service.update('os-1', { status: 'EM_EXECUCAO' }, { role: Role.ADMIN, id: 'admin-1' })
    ).rejects.toThrow(BadRequestException);
  });

  it('deve rejeitar mutação em ordens com status terminal CANCELADO', async () => {
    mockPrismaService.ordemServico.findFirst.mockResolvedValue({
      id: 'os-2',
      codigo: 'OS-100002',
      status: StatusOS.CANCELADO,
      prioridade: Prioridade.MEDIA,
      criado_em: new Date(),
    });

    await expect(
      service.update('os-2', { status: 'EM_TRIAGEM' }, { role: Role.GESTOR, id: 'gestor-1' })
    ).rejects.toThrow(BadRequestException);
  });

  it('deve exigir justificativa obrigatória para pausar OS (AGUARDANDO)', async () => {
    mockPrismaService.ordemServico.findFirst.mockResolvedValue({
      id: 'os-3',
      codigo: 'OS-100003',
      status: StatusOS.EM_EXECUCAO,
      prioridade: Prioridade.MEDIA,
      tecnico_atribuido_id: 'tec-1',
      criado_em: new Date(),
    });

    await expect(
      service.update('os-3', { status: 'AGUARDANDO' }, { role: Role.TECNICO, id: 'tec-1' })
    ).rejects.toThrow(BadRequestException);
  });

  it('deve exigir foto de conclusão obrigatória ao finalizar OS (CONCLUIDO)', async () => {
    mockPrismaService.ordemServico.findFirst.mockResolvedValue({
      id: 'os-4',
      codigo: 'OS-100004',
      status: StatusOS.EM_EXECUCAO,
      prioridade: Prioridade.MEDIA,
      fotos_conclusao: [],
      tecnico_atribuido_id: 'tec-1',
      criado_em: new Date(),
    });

    await expect(
      service.update('os-4', { status: 'CONCLUIDO', fotosConclusao: [] }, { role: Role.TECNICO, id: 'tec-1' })
    ).rejects.toThrow(BadRequestException);
  });

  it('deve impedir que TECNICO cancele ordem de serviço', async () => {
    mockPrismaService.ordemServico.findFirst.mockResolvedValue({
      id: 'os-5',
      codigo: 'OS-100005',
      status: StatusOS.EM_EXECUCAO,
      prioridade: Prioridade.MEDIA,
      tecnico_atribuido_id: 'tec-1',
      criado_em: new Date(),
    });

    await expect(
      service.update('os-5', { status: 'CANCELADO', motivoCancelamento: 'Não quero fazer' }, { role: Role.TECNICO, id: 'tec-1' })
    ).rejects.toThrow(ForbiddenException);
  });

  it('deve banir hard delete e converter remoção em CANCELADO com auditoria', async () => {
    mockPrismaService.ordemServico.findFirst.mockResolvedValue({
      id: 'os-6',
      codigo: 'OS-100006',
      status: StatusOS.EM_TRIAGEM,
      criado_em: new Date(),
    });
    mockPrismaService.ordemServico.update.mockResolvedValue({
      id: 'os-6',
      codigo: 'OS-100006',
      status: StatusOS.CANCELADO,
      motivo_cancelamento: 'Cancelamento por duplicidade de chamado',
    });

    const res = await service.remove('os-6', 'Cancelamento por duplicidade de chamado', { role: Role.GESTOR, id: 'gestor-1' });

    expect(res.success).toBe(true);
    expect(mockPrismaService.ordemServico.delete).not.toHaveBeenCalled();
    expect(mockPrismaService.ordemServico.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'os-6' },
        data: expect.objectContaining({
          status: StatusOS.CANCELADO,
          motivo_cancelamento: 'Cancelamento por duplicidade de chamado',
        }),
      })
    );
    expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalled();
  });

  it('deve bloquear atribuição se o técnico atingir o limite de sobrecarga (>= 3 ordens em execução)', async () => {
    mockPrismaService.ordemServico.findFirst.mockResolvedValue({
      id: 'os-7',
      codigo: 'OS-100007',
      status: StatusOS.EM_TRIAGEM,
      categoria: 'ELETRICA',
      prioridade: Prioridade.MEDIA,
      criado_em: new Date(),
    });

    mockPrismaService.usuario.findFirst.mockResolvedValue({
      id: 'tec-sobrecarregado',
      nome: 'Carlos Eletricista',
      role: Role.TECNICO,
      especialidade: 'ELETRICA',
    });

    // Simula 3 ordens já em execução para este técnico
    mockPrismaService.ordemServico.count = vi.fn().mockResolvedValue(3);

    await expect(
      service.update('os-7', { technician: 'Carlos Eletricista' }, { role: Role.GESTOR, id: 'gestor-1' })
    ).rejects.toThrow(BadRequestException);
  });

  it('deve bloquear atribuição em caso de incompatibilidade técnica de especialidade', async () => {
    mockPrismaService.ordemServico.findFirst.mockResolvedValue({
      id: 'os-8',
      codigo: 'OS-100008',
      status: StatusOS.EM_TRIAGEM,
      categoria: 'HIDRAULICA',
      prioridade: Prioridade.MEDIA,
      criado_em: new Date(),
    });

    mockPrismaService.usuario.findFirst.mockResolvedValue({
      id: 'tec-eletrica',
      nome: 'João Eletricista',
      role: Role.TECNICO,
      especialidade: 'ELETRICA',
    });

    mockPrismaService.ordemServico.count = vi.fn().mockResolvedValue(1);

    await expect(
      service.update('os-8', { technician: 'João Eletricista' }, { role: Role.GESTOR, id: 'gestor-1' })
    ).rejects.toThrow(BadRequestException);
  });

  it('deve sincronizar e criar evento na AgendaVistoria ao transicionar para AGENDADO', async () => {
    mockPrismaService.ordemServico.findFirst.mockResolvedValue({
      id: 'os-9',
      codigo: 'OS-100009',
      status: StatusOS.EM_TRIAGEM,
      categoria: 'ELETRICA',
      prioridade: Prioridade.MEDIA,
      tecnico_atribuido_id: 'tec-1',
      predio: { nome: 'EMEF Paulo Freire' },
      tecnico: { nome: 'Carlos Silva' },
      criado_em: new Date(),
    });

    mockPrismaService.agendaVistoria = {
      create: vi.fn(),
      findMany: vi.fn(),
    };

    mockPrismaService.$transaction = vi.fn().mockImplementation(async (callback) => {
      return callback({
        ordemServico: {
          update: vi.fn().mockResolvedValue({
            id: 'os-9',
            codigo: 'OS-100009',
            status: StatusOS.AGENDADO,
            prioridade: Prioridade.MEDIA,
            criado_em: new Date(),
          }),
        },
        agendaVistoria: mockPrismaService.agendaVistoria,
        auditoriaLog: mockPrismaService.auditoriaLog,
      });
    });

    const res = await service.update(
      'os-9',
      { status: 'AGENDADO', horarioAgendamento: '14:30' },
      { role: Role.GESTOR, id: 'gestor-1' }
    );

    expect(res.success).toBe(true);
    expect(mockPrismaService.agendaVistoria.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          horario: '14:30',
          ordem_servico_id: 'os-9',
        }),
      })
    );
  });

  it('deve recalcular data_limite_sla imediatamente na triagem ao alterar prioridade', async () => {
    mockPrismaService.ordemServico.findFirst.mockResolvedValue({
      id: 'os-10',
      codigo: 'OS-100010',
      status: StatusOS.EM_TRIAGEM,
      categoria: 'GERAL',
      prioridade: Prioridade.BAIXA,
      criado_em: new Date(Date.now() - 24 * 3600 * 1000), // criada ontem
    });

    let dadosAtualizados: any = null;
    mockPrismaService.$transaction = vi.fn().mockImplementation(async (callback) => {
      return callback({
        ordemServico: {
          update: vi.fn().mockImplementation(({ data }) => {
            dadosAtualizados = data;
            return {
              id: 'os-10',
              codigo: 'OS-100010',
              status: StatusOS.EM_TRIAGEM,
              prioridade: data.prioridade,
              data_limite_sla: data.data_limite_sla,
              criado_em: new Date(),
            };
          }),
        },
        auditoriaLog: mockPrismaService.auditoriaLog,
      });
    });

    // Gestor eleva prioridade de BAIXA para URGENTE
    await service.update('os-10', { prioridade: 'URGENTE' }, { role: Role.GESTOR, id: 'gestor-1' });

    expect(dadosAtualizados.prioridade).toBe(Prioridade.URGENTE);
    expect(dadosAtualizados.data_limite_sla).toBeDefined();
    // Prazo de URGENTE é 4h a partir de agora
    const diffHours = (dadosAtualizados.data_limite_sla.getTime() - Date.now()) / (3600 * 1000);
    expect(diffHours).toBeGreaterThan(3.9);
    expect(diffHours).toBeLessThan(4.1);
  });

  describe('Proteção IDOR / BOLA em findOne', () => {
    const mockOS = {
      id: 'os-idor-1',
      codigo: 'OS-999999',
      titulo: 'Vazamento no banheiro infantil',
      descricao: 'Vazamento contínuo',
      status: StatusOS.EM_EXECUCAO,
      prioridade: Prioridade.ALTA,
      solicitante_id: 'sol-escola-1',
      tecnico_atribuido_id: 'tec-1',
      predio: { id: 'pred-1', nome: 'EMEF Paulo Freire', tipo: 'ESCOLA' },
      solicitante: { id: 'sol-escola-1', nome: 'Diretor Pedro' },
      tecnico: { id: 'tec-1', nome: 'Carlos Técnico' },
      criado_em: new Date(),
    };

    it('deve bloquear Solicitante de outra escola de acessar OS por ID (IDOR)', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue(mockOS);

      const outroSolicitante = {
        id: 'sol-outro',
        role: Role.SOLICITANTE,
        facilityName: 'UBS Central',
      };

      await expect(service.findOne('os-idor-1', outroSolicitante)).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir Solicitante da mesma unidade ou autor acessar a OS', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue(mockOS);

      const mesmoSolicitante = {
        id: 'sol-escola-1',
        role: Role.SOLICITANTE,
        facilityName: 'EMEF Paulo Freire',
      };

      const res = await service.findOne('os-idor-1', mesmoSolicitante);
      expect(res.success).toBe(true);
      expect(res.data.id).toBe('os-idor-1');
    });

    it('deve bloquear Técnico não atribuído de acessar OS de outro técnico (IDOR)', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue(mockOS);

      const outroTecnico = {
        id: 'tec-outro',
        role: Role.TECNICO,
      };

      await expect(service.findOne('os-idor-1', outroTecnico)).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir Técnico atribuído acessar a sua OS', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue(mockOS);

      const tecnicoCorreto = {
        id: 'tec-1',
        role: Role.TECNICO,
      };

      const res = await service.findOne('os-idor-1', tecnicoCorreto);
      expect(res.success).toBe(true);
      expect(res.data.id).toBe('os-idor-1');
    });

    it('deve permitir Gestor ou Admin acessar qualquer OS', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue(mockOS);

      const gestor = { id: 'gestor-1', role: Role.GESTOR };
      const res = await service.findOne('os-idor-1', gestor);
      expect(res.success).toBe(true);
    });
  });

  describe('Consulta Pública de Rastreio (trackPublic)', () => {
    it('deve retornar dados públicos sanitizados sem expor dados sensíveis do servidor ou técnicos', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue({
        id: 'os-pub-1',
        codigo: 'OS-888888',
        titulo: 'Reparo de telhado',
        categoria: 'ALVENARIA',
        prioridade: Prioridade.ALTA,
        status: StatusOS.AGENDADO,
        predio: { nome: 'EMEF Santos Dumont', tipo: 'ESCOLA', endereco: 'Rua A, 100' },
        solicitante_id: 'sol-privado-1',
        tecnico_atribuido_id: 'tec-privado-1',
        fotos: ['https://privado.com/foto1.jpg'],
        criado_em: new Date('2026-10-06T10:00:00Z'),
        data_limite_sla: new Date('2026-10-07T10:00:00Z'),
      });

      const res = await service.trackPublic('OS-888888');
      expect(res.success).toBe(true);
      expect(res.data.codigo).toBe('OS-888888');
      expect(res.data.titulo).toBe('Reparo de telhado');
      expect(res.data.predio.nome).toBe('EMEF Santos Dumont');
      expect(res.data.status).toBe('SCHEDULED');
      expect((res.data as any).solicitante_id).toBeUndefined();
      expect((res.data as any).tecnico_atribuido_id).toBeUndefined();
      expect((res.data as any).fotos).toBeUndefined();
    });

    it('deve lançar NotFoundException para código inexistente', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue(null);

      await expect(service.trackPublic('OS-INEXISTENTE')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Medição Financeira e Peças Consumidas (Código vs ID)', () => {
    it('deve atualizar dados financeiros buscando tanto pelo ID quanto pelo código da OS', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue({
        id: 'os-aguardando-2',
        codigo: 'OS-104940',
        custo_materiais: 150,
        custo_mao_de_obra: 0,
        custo_total: 150,
        materiais_consumidos: [],
      });

      mockPrismaService.contratoManutencao.findUnique = vi.fn().mockResolvedValue({
        id: 'contrato-1',
        numero_contrato: '014/2026',
        numero_empenho: '2026NE00014',
        empresa_contratada: 'Alvorada Engenharia Ltda',
        ativo: true,
        valor_total_empenhado: 50000,
        ordens_servico: [],
      });

      mockPrismaService.ordemServico.update = vi.fn().mockResolvedValue({
        id: 'os-aguardando-2',
        codigo: 'OS-104940',
        prioridade: Prioridade.MEDIA,
        status: StatusOS.AGUARDANDO,
        criado_em: new Date(),
        custo_materiais: 150,
        custo_mao_de_obra: 300,
        custo_total: 450,
        empresa_terceirizada: 'Alvorada Engenharia Ltda',
        numero_empenho: '2026NE00014',
        contrato_id: 'contrato-1',
        materiais_consumidos: [],
      });

      // Passando o CÓDIGO da OS em vez do UUID/ID
      const res = await service.updateFinancials('OS-104940', {
        contratoId: 'contrato-1',
        custoMaoDeObra: 300,
      });

      expect(res.success).toBe(true);
      expect(mockPrismaService.ordemServico.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { OR: [{ id: 'OS-104940' }, { codigo: 'OS-104940' }] },
        })
      );
      expect(mockPrismaService.ordemServico.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'os-aguardando-2' },
        })
      );
    });

    it('deve rejeitar vinculação se o contrato administrativo estiver inativo', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue({
        id: 'os-fin-1',
        codigo: 'OS-100001',
        custo_materiais: 100,
        custo_mao_de_obra: 0,
        custo_total: 100,
      });

      mockPrismaService.contratoManutencao.findUnique = vi.fn().mockResolvedValue({
        id: 'contrato-inativo',
        numero_contrato: '099/2025',
        ativo: false,
        valor_total_empenhado: 10000,
        ordens_servico: [],
      });

      await expect(
        service.updateFinancials('os-fin-1', {
          contratoId: 'contrato-inativo',
          custoMaoDeObra: 50,
        })
      ).rejects.toThrow(ConflictException);
    });

    it('deve rejeitar medição se a vigência do contrato estiver expirada', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue({
        id: 'os-fin-2',
        codigo: 'OS-100002',
        custo_materiais: 100,
        custo_mao_de_obra: 0,
        custo_total: 100,
      });

      const dataExpirada = new Date(Date.now() - 24 * 3600 * 1000); // Ontem
      mockPrismaService.contratoManutencao.findUnique = vi.fn().mockResolvedValue({
        id: 'contrato-vencido',
        numero_contrato: '001/2024',
        ativo: true,
        vigencia_fim: dataExpirada,
        valor_total_empenhado: 10000,
        ordens_servico: [],
      });

      await expect(
        service.updateFinancials('os-fin-2', {
          contratoId: 'contrato-vencido',
          custoMaoDeObra: 50,
        })
      ).rejects.toThrow(ConflictException);
    });

    it('deve aplicar Hard Block com ConflictException quando o custo total exceder o saldo restante do empenho', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue({
        id: 'os-fin-3',
        codigo: 'OS-100003',
        custo_materiais: 300,
        custo_mao_de_obra: 0,
        custo_total: 300,
      });

      // Contrato de 1000 com 800 já medido em outras OS -> Saldo disponível = 200
      mockPrismaService.contratoManutencao.findUnique = vi.fn().mockResolvedValue({
        id: 'contrato-quase-esgotado',
        numero_contrato: '012/2026',
        ativo: true,
        valor_total_empenhado: 1000,
        ordens_servico: [
          { id: 'os-outra-1', custo_total: 500 },
          { id: 'os-outra-2', custo_total: 300 },
        ],
      });

      // Tentando adicionar custo total de 300 (materiais) + 100 (mão de obra) = 400 > 200
      await expect(
        service.updateFinancials('os-fin-3', {
          contratoId: 'contrato-quase-esgotado',
          custoMaoDeObra: 100,
        })
      ).rejects.toThrow(ConflictException);
    });

    it('deve registrar AuditoriaLog imutável com diff detalhado quando a medição for salva com sucesso', async () => {
      mockPrismaService.ordemServico.findFirst.mockResolvedValue({
        id: 'os-fin-audit',
        codigo: 'OS-100004',
        custo_materiais: 100,
        custo_mao_de_obra: 50,
        custo_total: 150,
        contrato_id: null,
        prefeitura_id: 'pref-01',
      });

      mockPrismaService.contratoManutencao.findUnique = vi.fn().mockResolvedValue({
        id: 'contrato-valido',
        numero_contrato: '015/2026',
        numero_empenho: '2026NE00015',
        empresa_contratada: 'Delta Engenharia',
        ativo: true,
        valor_total_empenhado: 50000,
        ordens_servico: [],
      });

      mockPrismaService.ordemServico.update = vi.fn().mockResolvedValue({
        id: 'os-fin-audit',
        codigo: 'OS-100004',
        prioridade: Prioridade.MEDIA,
        status: StatusOS.AGUARDANDO,
        criado_em: new Date(),
        custo_materiais: 100,
        custo_mao_de_obra: 200,
        custo_total: 300,
        empresa_terceirizada: 'Delta Engenharia',
        numero_empenho: '2026NE00015',
        contrato_id: 'contrato-valido',
        materiais_consumidos: [],
      });

      const user = { id: 'gestor-uuid-1', prefeituraId: 'pref-01', role: Role.GESTOR };

      const res = await service.updateFinancials('os-fin-audit', {
        contratoId: 'contrato-valido',
        custoMaoDeObra: 200,
      }, user);

      expect(res.success).toBe(true);
      expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entidade_afetada: 'ordens_servico',
          entidade_id: 'os-fin-audit',
          acao: AuditAction.UPDATE,
          usuario_id: 'gestor-uuid-1',
          prefeitura_id: 'pref-01',
          dados_antigos: expect.objectContaining({
            custo_total: 150,
          }),
          dados_novos: expect.objectContaining({
            contrato_id: 'contrato-valido',
            custo_total: 300,
          }),
        }),
      });
    });
  });
});


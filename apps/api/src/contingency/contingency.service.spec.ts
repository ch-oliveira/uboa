import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ContingencyService } from './contingency.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role, AuditAction, TipoPredio } from '@repo/database';

describe('ContingencyService - Plano de Contingência e Defesa Civil', () => {
  let service: ContingencyService;

  const mockPrismaService = {
    alertaDefesaCivil: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    predio: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    agendaVistoria: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    auditoriaLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      return callback(mockPrismaService);
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPrismaService.$transaction.mockImplementation(async (callback) => {
      return callback(mockPrismaService);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContingencyService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ContingencyService>(ContingencyService);
  });

  it('deve disparar plano de contingência gerando vistorias preventivas com checklist para CHUVA_INTENSA', async () => {
    mockPrismaService.predio.findMany.mockResolvedValue([
      {
        id: 'predio-1',
        nome: 'EMEF Paulo Freire',
        tipo: TipoPredio.ESCOLA,
        ativo: true,
        prefeitura_id: 'pref-01',
      },
      {
        id: 'predio-2',
        nome: 'UBS Vila Real',
        tipo: TipoPredio.UBS,
        ativo: true,
        prefeitura_id: 'pref-01',
      },
    ]);

    mockPrismaService.agendaVistoria.create
      .mockResolvedValueOnce({
        id: 'vistoria-1',
        titulo: '[DEFESA CIVIL] Contingência: CHUVA_INTENSA - EMEF Paulo Freire',
        categoria_vistoria: 'CONTINGENCIA_CLIMA',
        predio_id: 'predio-1',
      })
      .mockResolvedValueOnce({
        id: 'vistoria-2',
        titulo: '[DEFESA CIVIL] Contingência: CHUVA_INTENSA - UBS Vila Real',
        categoria_vistoria: 'CONTINGENCIA_CLIMA',
        predio_id: 'predio-2',
      });

    const res = await service.triggerContingencyPlan(
      {
        tipoEvento: 'CHUVA_INTENSA',
        nivel: 'PERIGO',
      },
      { id: 'gestor-1', role: Role.GESTOR, prefeituraId: 'pref-01' }
    );

    expect(res.success).toBe(true);
    expect(res.data.vistoriasGeradasCount).toBe(2);
    expect(mockPrismaService.predio.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          prefeitura_id: 'pref-01',
          ativo: true,
        }),
      })
    );
    expect(mockPrismaService.agendaVistoria.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          categoria_vistoria: 'CONTINGENCIA_CLIMA',
          checklist_itens: expect.arrayContaining([
            expect.objectContaining({
              item: expect.stringContaining('calhas'),
            }),
          ]),
        }),
      })
    );
    expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entidade_afetada: 'alertas_defesa_civil',
          acao: AuditAction.CREATE,
          usuario_id: 'gestor-1',
        }),
      })
    );
  });

  it('deve listar alertas de Defesa Civil com cálculo de taxa de conformidade preventiva', async () => {
    mockPrismaService.alertaDefesaCivil.findMany.mockResolvedValue([
      {
        id: 'alerta-1',
        titulo: 'Alerta Laranja de Tempestade',
        nivel: 'PERIGO',
        tipo_evento: 'CHUVA_INTENSA',
        ativo: true,
        prefeitura_id: 'pref-01',
        criado_em: new Date(),
        vistorias_contingencia: [
          { id: 'v1', concluido: true, risco_mitigado: true },
          { id: 'v2', concluido: false, risco_mitigado: false },
        ],
      },
    ]);

    const res = await service.findAllAlerts({ id: 'gestor-1', prefeituraId: 'pref-01' });

    expect(res.success).toBe(true);
    expect(res.data.length).toBe(1);
    expect(res.data[0].totalVistorias).toBe(2);
    expect(res.data[0].vistoriasConcluidas).toBe(1);
    expect(res.data[0].percentualConformidade).toBe(50);
  });

  it('deve registrar conclusão de vistoria de contingência com mitigação de risco e laudo', async () => {
    mockPrismaService.agendaVistoria.findFirst.mockResolvedValue({
      id: 'vistoria-1',
      titulo: '[DEFESA CIVIL] Contingência: CHUVA_INTENSA - EMEF Paulo Freire',
      categoria_vistoria: 'CONTINGENCIA_CLIMA',
      concluido: false,
      prefeitura_id: 'pref-01',
      predio: { nome: 'EMEF Paulo Freire' },
    });

    mockPrismaService.agendaVistoria.update.mockResolvedValue({
      id: 'vistoria-1',
      concluido: true,
      risco_mitigado: true,
      laudo_tecnico: 'Calhas desobstruídas e bomba de porão testada com sucesso.',
      checklist_itens: [
        { item: 'Limpeza de calhas e ralos', checado: true, observacao: '100% limpo' },
      ],
      prefeitura_id: 'pref-01',
      criado_em: new Date(),
    });

    const res = await service.completeContingencyInspection(
      'vistoria-1',
      {
        riscoMitigado: true,
        laudoTecnico: 'Calhas desobstruídas e bomba de porão testada com sucesso.',
        checklistItens: [
          { item: 'Limpeza de calhas e ralos', checado: true, observacao: '100% limpo' },
        ],
      },
      { id: 'tec-1', role: Role.TECNICO, prefeituraId: 'pref-01' }
    );

    expect(res.success).toBe(true);
    expect(mockPrismaService.agendaVistoria.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'vistoria-1' },
        data: expect.objectContaining({
          concluido: true,
          risco_mitigado: true,
          laudo_tecnico: 'Calhas desobstruídas e bomba de porão testada com sucesso.',
        }),
      })
    );
  });
});

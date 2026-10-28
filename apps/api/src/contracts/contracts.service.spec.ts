import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ContractsService } from './contracts.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusOS } from '@repo/database';

describe('ContractsService - Gestão de Contratos e Saldo de Empenho', () => {
  let service: ContractsService;

  const mockPrismaService = {
    contratoManutencao: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditoriaLog: {
      create: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ContractsService>(ContractsService);
  });

  it('deve ignorar Ordens de Serviço CANCELADAS no cálculo de valorTotalMedido e saldoRestante em findAll', async () => {
    mockPrismaService.contratoManutencao.findMany.mockResolvedValue([
      {
        id: 'cont-1',
        numero_contrato: '014/2026',
        numero_empenho: '2026NE00412',
        empresa_contratada: 'Alvorada Engenharia',
        categoria_padrao: 'ELETRICA',
        valor_total_empenhado: 10000,
        ativo: true,
        prefeitura_id: 'pref-01',
        criado_em: new Date(),
        ordens_servico: [
          { id: 'os-1', custo_total: 2500, status: StatusOS.CONCLUIDO },
          { id: 'os-2', custo_total: 1500, status: StatusOS.EM_EXECUCAO },
          { id: 'os-3-cancelada', custo_total: 4000, status: StatusOS.CANCELADO },
        ],
      },
    ]);

    const res = await service.findAll({ id: 'gestor-1', prefeituraId: 'pref-01' });

    expect(res.success).toBe(true);
    expect(res.data[0].valorTotalMedido).toBe(4000);
    expect(res.data[0].saldoRestante).toBe(6000);
    expect(res.data[0].percentualExecutado).toBe(40);
  });

  it('deve ignorar Ordens de Serviço CANCELADAS no cálculo de valorTotalMedido em findOne', async () => {
    mockPrismaService.contratoManutencao.findFirst.mockResolvedValue({
      id: 'cont-1',
      numero_contrato: '014/2026',
      numero_empenho: '2026NE00412',
      empresa_contratada: 'Alvorada Engenharia',
      categoria_padrao: 'ELETRICA',
      valor_total_empenhado: 10000,
      ativo: true,
      prefeitura_id: 'pref-01',
      criado_em: new Date(),
      ordens_servico: [
        {
          id: 'os-1',
          codigo: 'OS-100001',
          titulo: 'Reparo Quadro',
          status: StatusOS.CONCLUIDO,
          custo_materiais: 1000,
          custo_mao_de_obra: 500,
          custo_total: 1500,
          criado_em: new Date(),
          predio: { nome: 'EMEF Paulo Freire' },
        },
        {
          id: 'os-2-cancelada',
          codigo: 'OS-100002',
          titulo: 'Chamado Duplicado Cancelado',
          status: StatusOS.CANCELADO,
          custo_materiais: 3000,
          custo_mao_de_obra: 2000,
          custo_total: 5000,
          criado_em: new Date(),
          predio: { nome: 'EMEF Paulo Freire' },
        },
      ],
    });

    const res = await service.findOne('cont-1', { id: 'gestor-1', prefeituraId: 'pref-01' });

    expect(res.success).toBe(true);
    expect(res.data.valorTotalMedido).toBe(1500);
    expect(res.data.saldoRestante).toBe(8500);
  });
});


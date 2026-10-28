import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AssetsService } from './assets.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { AuditAction, StatusOS } from '@repo/database';

describe('AssetsService - Gestão de Ativos, Equipamentos e Etiquetas QR Code', () => {
  let service: AssetsService;

  const mockPrismaService = {
    ativoPredial: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    predio: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    auditoriaLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      return callback({
        ativoPredial: mockPrismaService.ativoPredial,
        auditoriaLog: mockPrismaService.auditoriaLog,
      });
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  it('deve filtrar ativos pelo prefeitura_id do usuário autenticado e calcular alerta de antieconomicidade (3+ OSs)', async () => {
    mockPrismaService.ativoPredial.findMany.mockResolvedValue([
      {
        id: 'ativo-1',
        codigo_patrimonio: 'PAT-2026-101',
        nome: 'Ar-Condicionado Split 24.000 BTUs',
        categoria: 'CLIMATIZACAO',
        ambiente: 'Sala de Aula 04',
        marca_modelo: 'Springer Midea Inverter',
        status: 'OPERACIONAL',
        garantia_ate: null,
        custo_acumulado: 1850,
        ativo: true,
        predio_id: 'pred-1',
        prefeitura_id: 'pref-01',
        criado_em: new Date(),
        predio: { id: 'pred-1', nome: 'EMEF Paulo Freire', tipo: 'ESCOLA' },
        ordens_servico: [
          { id: 'os-1', status: StatusOS.CONCLUIDO, custo_total: 600 },
          { id: 'os-2', status: StatusOS.CONCLUIDO, custo_total: 750 },
          { id: 'os-3', status: StatusOS.EM_EXECUCAO, custo_total: 500 },
          { id: 'os-4-canc', status: StatusOS.CANCELADO, custo_total: 900 },
        ],
      },
    ]);

    const res = await service.findAll(
      { facilityId: 'pred-1' },
      { id: 'gestor-1', prefeituraId: 'pref-01' },
    );

    expect(res.success).toBe(true);
    expect(mockPrismaService.ativoPredial.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          prefeitura_id: 'pref-01',
        }),
      }),
    );

    const item = res.data[0];
    expect(item.totalChamados).toBe(3); // Ignora a OS cancelada
    expect(item.chamadosAbertos).toBe(1);
    expect(item.custoAcumulado).toBe(1850);
    expect(item.alertaSubstituicao).toBe(true);
    expect(item.recomendacaoTce).toContain('antieconomicidade');
    expect(item.qrCodeUrl).toContain('patrimonio=PAT-2026-101');
  });

  it('deve identificar equipamento EM GARANTIA vigente e orientar acionamento sem ônus ao erário', async () => {
    const futuro = new Date(Date.now() + 90 * 24 * 3600 * 1000);
    mockPrismaService.ativoPredial.findMany.mockResolvedValue([
      {
        id: 'ativo-garantia',
        codigo_patrimonio: 'PAT-2026-202',
        nome: 'Bomba de Recalque 5CV',
        categoria: 'HIDRAULICA',
        ambiente: 'Casa de Bombas',
        status: 'OPERACIONAL',
        garantia_ate: futuro,
        custo_acumulado: 0,
        ativo: true,
        predio_id: 'pred-1',
        prefeitura_id: 'pref-01',
        criado_em: new Date(),
        predio: { id: 'pred-1', nome: 'UBS Vila Nova', tipo: 'UBS' },
        ordens_servico: [],
      },
    ]);

    const res = await service.findAll({}, { id: 'gestor-1', prefeituraId: 'pref-01' });

    expect(res.data[0].emGarantia).toBe(true);
    expect(res.data[0].recomendacaoTce).toContain('garantia vigente');
  });

  it('deve impedir criação de ativo com código de patrimônio duplicado na mesma prefeitura', async () => {
    mockPrismaService.ativoPredial.findFirst.mockResolvedValue({
      id: 'existente',
      codigo_patrimonio: 'PAT-2026-101',
      prefeitura_id: 'pref-01',
    });

    await expect(
      service.create(
        {
          codigoPatrimonio: 'PAT-2026-101',
          nome: 'Quadro Elétrico QGBT',
          ambiente: 'Corredor Principal',
          predioId: 'pred-1',
        },
        { id: 'gestor-1', prefeituraId: 'pref-01' },
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('deve cadastrar novo ativo com sucesso e gravar AuditoriaLog', async () => {
    mockPrismaService.ativoPredial.findFirst.mockResolvedValue(null);
    mockPrismaService.predio.findFirst.mockResolvedValue({
      id: 'pred-1',
      nome: 'EMEF Paulo Freire',
    });
    mockPrismaService.ativoPredial.create.mockResolvedValue({
      id: 'novo-ativo-1',
      codigo_patrimonio: 'PAT-2026-500',
      nome: 'Quadro Elétrico QGBT-01',
      categoria: 'ELETRICA',
      ambiente: 'Bloco Pedagógico Térreo',
      marca_modelo: 'Schneider Electric',
      status: 'OPERACIONAL',
      custo_acumulado: 0,
      ativo: true,
      predio_id: 'pred-1',
      prefeitura_id: 'pref-01',
      criado_em: new Date(),
      predio: { id: 'pred-1', nome: 'EMEF Paulo Freire', tipo: 'ESCOLA' },
      ordens_servico: [],
    });

    const res = await service.create(
      {
        codigoPatrimonio: 'pat-2026-500',
        nome: 'Quadro Elétrico QGBT-01',
        categoria: 'ELETRICA',
        ambiente: 'Bloco Pedagógico Térreo',
        marcaModelo: 'Schneider Electric',
        predioId: 'pred-1',
      },
      { id: 'gestor-1', prefeituraId: 'pref-01' },
    );

    expect(res.success).toBe(true);
    expect(res.data.codigoPatrimonio).toBe('PAT-2026-500');
    expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entidade_afetada: 'AtivoPredial',
          acao: AuditAction.CREATE,
          prefeitura_id: 'pref-01',
        }),
      }),
    );
  });

  it('deve bloquear acesso (ForbiddenException) em findOne quando o ativo pertencer a outra prefeitura', async () => {
    mockPrismaService.ativoPredial.findUnique.mockResolvedValue({
      id: 'ativo-outra',
      codigo_patrimonio: 'PAT-999',
      nome: 'Gerador',
      ambiente: 'Subsolo',
      predio_id: 'pred-9',
      prefeitura_id: 'pref-americana',
      criado_em: new Date(),
    });

    await expect(
      service.findOne('ativo-outra', { id: 'gestor-1', prefeituraId: 'pref-osasco' }),
    ).rejects.toThrow(ForbiddenException);
  });
});


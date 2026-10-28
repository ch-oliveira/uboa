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
    boletimMedicao: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    ordemServico: {
      updateMany: vi.fn(),
      findMany: vi.fn(),
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

  describe('Boletim de Medição Mensal Consolidado (SINAPI + BDI)', () => {
    it('deve pré-visualizar boletim calculando BDI e considerando apenas OSs com atesto APROVADO', async () => {
      mockPrismaService.contratoManutencao.findFirst.mockResolvedValue({
        id: 'cont-1',
        numero_contrato: '014/2026',
        numero_empenho: '2026NE00412',
        empresa_contratada: 'Alvorada Engenharia',
        valor_total_empenhado: 100000,
        bdi_padrao: 20.00,
        prefeitura_id: 'pref-01',
        ordens_servico: [
          // OS 1: Aprovada com atesto
          {
            id: 'os-1',
            codigo: 'OS-100001',
            titulo: 'Troca Disjuntores',
            status: StatusOS.CONCLUIDO,
            status_atesto: 'APROVADO',
            atestado_em: new Date('2026-10-15'),
            boletim_medicao_id: null,
            custo_materiais: 1000,
            custo_mao_de_obra: 1000,
            custo_total: 2000,
            concluido_em: new Date('2026-10-14'),
            materiais_consumidos: [
              { descricao: 'Disjuntor Bipolar 32A SINAPI-1234', quantidade: 2, precoUnitario: 50, precoTotal: 100 }
            ],
            predio: { nome: 'EMEF Paulo Freire' },
          },
          // OS 2: Concluída mas com atesto PENDENTE (NÃO pode ser incluída na medição pública)
          {
            id: 'os-2',
            codigo: 'OS-100002',
            titulo: 'Conserto Bomba',
            status: StatusOS.CONCLUIDO,
            status_atesto: 'PENDENTE',
            boletim_medicao_id: null,
            custo_materiais: 3000,
            custo_mao_de_obra: 1000,
            custo_total: 4000,
            concluido_em: new Date('2026-10-16'),
            predio: { nome: 'UBS Vila Real' },
          },
        ],
      });

      const res = await (service as any).previewBoletim(
        'cont-1',
        { mes: 10, ano: 2026, bdiPercentual: 20 },
        { id: 'fiscal-1', prefeituraId: 'pref-01' }
      );

      expect(res.success).toBe(true);
      // Somente OS 1 deve ser medida (custo direto: 2.000)
      expect(res.data.valorMateriais).toBe(1000);
      expect(res.data.valorMaoDeObra).toBe(1000);
      expect(res.data.valorDireto).toBe(2000);
      expect(res.data.bdiPercentual).toBe(20);
      // BDI de 20% sobre 2.000 = 400
      expect(res.data.valorBdi).toBe(400);
      expect(res.data.valorTotal).toBe(2400);
      expect(res.data.ordensAprovadasCount).toBe(1);
      expect(res.data.ordensPendentesCount).toBe(1);
    });

    it('deve consolidar e criar Boletim de Medição com hash de integridade e auditoria', async () => {
      mockPrismaService.contratoManutencao.findFirst.mockResolvedValue({
        id: 'cont-1',
        numero_contrato: '014/2026',
        numero_empenho: '2026NE00412',
        empresa_contratada: 'Alvorada Engenharia',
        valor_total_empenhado: 100000,
        bdi_padrao: 20.00,
        prefeitura_id: 'pref-01',
        ordens_servico: [
          {
            id: 'os-1',
            codigo: 'OS-100001',
            status: StatusOS.CONCLUIDO,
            status_atesto: 'APROVADO',
            boletim_medicao_id: null,
            custo_materiais: 1000,
            custo_mao_de_obra: 1000,
            custo_total: 2000,
            concluido_em: new Date('2026-10-14'),
            predio: { nome: 'EMEF Paulo Freire' },
          },
        ],
      });

      mockPrismaService.boletimMedicao.count.mockResolvedValue(0);
      mockPrismaService.boletimMedicao.create.mockResolvedValue({
        id: 'bm-1',
        numero_boletim: 'BM-2026-001',
        mes_competencia: 10,
        ano_competencia: 2026,
        data_inicio: new Date('2026-10-01'),
        data_fim: new Date('2026-10-31'),
        valor_direto: 2000,
        valor_bdi: 400,
        valor_total: 2400,
        status: 'APROVADO',
        hash_integridade: 'hash-mock',
        contrato_id: 'cont-1',
        prefeitura_id: 'pref-01',
        criado_em: new Date(),
      });

      const res = await (service as any).createBoletim(
        'cont-1',
        {
          mesCompetencia: 10,
          anoCompetencia: 2026,
          bdiPercentual: 20,
          observacoes: 'Medição mensal de outubro referente à manutenção preventiva e corretiva.',
        },
        { id: 'fiscal-1', prefeituraId: 'pref-01' }
      );

      expect(res.success).toBe(true);
      expect(mockPrismaService.boletimMedicao.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            numero_boletim: expect.stringMatching(/BM-/),
            mes_competencia: 10,
            ano_competencia: 2026,
            valor_direto: 2000,
            valor_bdi: 400,
            valor_total: 2400,
            hash_integridade: expect.any(String),
          }),
        })
      );
      expect(mockPrismaService.ordemServico.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: ['os-1'] } },
          data: { boletim_medicao_id: 'bm-1' },
        })
      );
      expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            entidade_afetada: 'boletins_medicao',
            entidade_id: 'bm-1',
          }),
        })
      );
    });
  });
});



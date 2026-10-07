import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusOS, Role } from '@repo/database';
import { ForbiddenException } from '@nestjs/common';

describe('ReportsService - Métricas, Relatórios e Auditoria Fiscal', () => {
  let service: ReportsService;

  const mockPrismaService = {
    ordemServico: {
      findMany: vi.fn(),
    },
    agendaVistoria: {
      findMany: vi.fn(),
    },
    configuracaoSistema: {
      findFirst: vi.fn().mockResolvedValue({
        preventiva_goal: 80,
      }),
    },
    auditoriaLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  describe('Controle de Acesso RBAC (Exclusivo ADMIN)', () => {
    it('deve BLOQUEAR usuário SOLICITANTE de acessar o resumo de relatórios fiscais', async () => {
      await expect(
        service.getSummary({}, { role: Role.SOLICITANTE, id: 'user-solic' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve BLOQUEAR usuário TECNICO de exportar dados para auditoria', async () => {
      await expect(
        service.exportAuditCsv({}, { role: Role.TECNICO, id: 'user-tec' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve PERMITIR acesso total para ADMIN', async () => {
      mockPrismaService.ordemServico.findMany.mockResolvedValue([]);
      mockPrismaService.agendaVistoria.findMany.mockResolvedValue([]);

      const result = await service.getSummary({}, { role: Role.ADMIN, id: 'admin-1' });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('Cálculo de MTTR Líquido (Descontando Pausas)', () => {
    it('deve calcular MTTR apenas sobre ordens CONCLUIDAS e descontar minutos de pausa', async () => {
      const now = new Date();
      // OS 1: Aberta há 10h, concluída há 2h (tempo bruto: 8h = 480 min). Pausa de 120 min (2h). Tempo líquido: 6h.
      const os1 = {
        id: 'os-1',
        status: StatusOS.CONCLUIDO,
        criado_em: new Date(now.getTime() - 10 * 3600 * 1000),
        concluido_em: new Date(now.getTime() - 2 * 3600 * 1000),
        tempo_pausa_minutos: 120, // 2h pausado
        sla_violado: false,
      };

      // OS 2: Aberta há 4h, concluída há 0h (tempo bruto: 4h = 240 min). Sem pausa. Tempo líquido: 4h.
      const os2 = {
        id: 'os-2',
        status: StatusOS.CONCLUIDO,
        criado_em: new Date(now.getTime() - 4 * 3600 * 1000),
        concluido_em: now,
        tempo_pausa_minutos: 0,
        sla_violado: false,
      };

      // OS 3: Aberta e AINDA EM EXECUCAO (NÃO entra no cálculo de MTTR)
      const os3 = {
        id: 'os-3',
        status: StatusOS.EM_EXECUCAO,
        criado_em: new Date(now.getTime() - 20 * 3600 * 1000),
        concluido_em: null,
        tempo_pausa_minutos: 0,
      };

      mockPrismaService.ordemServico.findMany.mockResolvedValue([os1, os2, os3]);
      mockPrismaService.agendaVistoria.findMany.mockResolvedValue([]);

      const res = await service.getSummary({}, { role: Role.ADMIN, id: 'admin-1' });

      // Média líquida: (6h + 4h) / 2 = 5.0h
      expect(res.data.totalConcluidas).toBe(2);
      expect(res.data.mttrHoras).toBe(5);
      expect(res.data.tempoTotalPausadoHoras).toBe(2); // 120 min / 60 = 2h
    });
  });

  describe('Conformidade Fiscal de Manutenção Preventiva (Meta 80%, Alerta 70%)', () => {
    it('deve classificar como CONFORME quando índice preventivo for >= 80%', async () => {
      // 2 OSs corretivas e 8 Vistorias preventivas => 8 / 10 = 80%
      mockPrismaService.ordemServico.findMany.mockResolvedValue([
        { id: 'os-1', status: StatusOS.CONCLUIDO, criado_em: new Date() },
        { id: 'os-2', status: StatusOS.CONCLUIDO, criado_em: new Date() },
      ]);
      mockPrismaService.agendaVistoria.findMany.mockResolvedValue(
        Array(8).fill({ id: 'vistoria-x', concluido: true }),
      );

      const res = await service.getSummary({}, { role: Role.ADMIN, id: 'admin-1' });
      expect(res.data.indicePreventivaPercent).toBe(80);
      expect(res.data.conformidadeFiscal).toBe('CONFORME');
    });

    it('deve classificar como ATENCAO quando índice preventivo estiver entre 70% e 79.9%', async () => {
      // 3 OSs corretivas e 7 Vistorias => 7 / 10 = 70%
      mockPrismaService.ordemServico.findMany.mockResolvedValue([
        { id: 'os-1', status: StatusOS.CONCLUIDO, criado_em: new Date() },
        { id: 'os-2', status: StatusOS.CONCLUIDO, criado_em: new Date() },
        { id: 'os-3', status: StatusOS.CONCLUIDO, criado_em: new Date() },
      ]);
      mockPrismaService.agendaVistoria.findMany.mockResolvedValue(
        Array(7).fill({ id: 'vistoria-x', concluido: true }),
      );

      const res = await service.getSummary({}, { role: Role.ADMIN, id: 'admin-1' });
      expect(res.data.indicePreventivaPercent).toBe(70);
      expect(res.data.conformidadeFiscal).toBe('ATENCAO');
      expect(res.data.mensagemConformidade).toContain('Alerta de Atenção');
    });

    it('deve classificar como CRITICO quando índice preventivo for < 70%', async () => {
      // 5 OSs corretivas e 2 Vistorias => 2 / 7 = 28.6%
      mockPrismaService.ordemServico.findMany.mockResolvedValue([
        { id: 'os-1', status: StatusOS.CONCLUIDO, criado_em: new Date() },
        { id: 'os-2', status: StatusOS.CONCLUIDO, criado_em: new Date() },
        { id: 'os-3', status: StatusOS.CONCLUIDO, criado_em: new Date() },
        { id: 'os-4', status: StatusOS.CONCLUIDO, criado_em: new Date() },
        { id: 'os-5', status: StatusOS.CONCLUIDO, criado_em: new Date() },
      ]);
      mockPrismaService.agendaVistoria.findMany.mockResolvedValue([
        { id: 'v-1', concluido: true },
        { id: 'v-2', concluido: true },
      ]);

      const res = await service.getSummary({}, { role: Role.ADMIN, id: 'admin-1' });
      expect(res.data.indicePreventivaPercent).toBeLessThan(70);
      expect(res.data.conformidadeFiscal).toBe('CRITICO');
      expect(res.data.mensagemConformidade).toContain('Alerta Crítico');
    });
  });

  describe('Exportação de CSV para Tribunal de Contas e Auditoria', () => {
    it('deve gerar CSV estruturado com colunas fiscais e registrar AuditoriaLog', async () => {
      const now = new Date();
      mockPrismaService.ordemServico.findMany.mockResolvedValue([
        {
          id: 'os-1',
          codigo: 'OS-100001',
          titulo: 'Vazamento de água',
          predio: { nome: 'Escola Municipal Paulo Freire', setor: 'Educação' },
          prioridade: 'ALTA',
          status: 'CONCLUIDO',
          tecnico: { nome: 'Carlos Silva' },
          criado_em: now,
          concluido_em: now,
          tempo_pausa_minutos: 30,
          data_limite_sla: now,
          sla_violado: false,
          motivo_pausa: 'Aguardando registro de pressão',
        },
      ]);

      const res = await service.exportAuditCsv(
        {},
        { role: Role.ADMIN, id: 'admin-1', nome: 'Mariana Gestora' },
      );

      expect(res.success).toBe(true);
      expect(res.data.csvContent).toContain('OS-100001');
      expect(res.data.csvContent).toContain('Escola Municipal Paulo Freire');
      expect(res.data.csvContent).toContain('Aguardando registro de pressão');
      expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            entidade_afetada: 'RelatorioFiscal',
            usuario_id: 'admin-1',
          }),
        }),
      );
    });
  });
});

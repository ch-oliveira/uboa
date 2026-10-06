import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AgendaService } from './agenda.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuditAction } from '@repo/database';

describe('AgendaService - Vistorias e Manutenção Preventiva', () => {
  let service: AgendaService;

  const mockPrismaService = {
    agendaVistoria: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditoriaLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      return callback({
        agendaVistoria: mockPrismaService.agendaVistoria,
        auditoriaLog: mockPrismaService.auditoriaLog,
      });
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendaService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AgendaService>(AgendaService);
  });

  describe('Conflito de Horários de Técnicos na Agenda', () => {
    it('deve BLOQUEAR agendamento se o técnico já possuir vistoria no mesmo horário em outra unidade', async () => {
      mockPrismaService.agendaVistoria.findMany.mockResolvedValue([
        {
          id: 'vis-1',
          titulo: 'Inspeção Elétrica',
          subtitulo: 'UBS Vila Nova',
          predio_id: 'pred-ubs',
          horario: '10:00',
          tecnico: 'Carlos Técnico',
          concluido: false,
        },
      ]);

      await expect(
        service.create({
          title: 'Vistoria Hidráulica',
          location: 'EMEF Paulo Freire',
          facilityId: 'pred-escola', // Unidade DIFERENTE
          scheduledTime: '10:00', // Mesmo horário
          technicianName: 'Carlos Técnico',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve PERMITIR agendamento simultâneo se for na MESMA unidade predial', async () => {
      mockPrismaService.agendaVistoria.findMany.mockResolvedValue([
        {
          id: 'vis-1',
          titulo: 'Inspeção Elétrica - Bloco A',
          subtitulo: 'EMEF Paulo Freire',
          predio_id: 'pred-escola',
          horario: '10:00',
          tecnico: 'Carlos Técnico',
          concluido: false,
        },
      ]);

      mockPrismaService.agendaVistoria.create.mockResolvedValue({
        id: 'vis-2',
        titulo: 'Inspeção Hidráulica - Bloco B',
        subtitulo: 'EMEF Paulo Freire',
        predio_id: 'pred-escola', // MESMA unidade
        horario: '10:00',
        tipo: 'hidraulica',
        recorrencia: 'UNICA',
        tecnico: 'Carlos Técnico',
        concluido: false,
        criado_em: new Date(),
      });

      const res = await service.create({
        title: 'Inspeção Hidráulica - Bloco B',
        location: 'EMEF Paulo Freire',
        facilityId: 'pred-escola',
        scheduledTime: '10:00',
        technicianName: 'Carlos Técnico',
      });

      expect(res.success).toBe(true);
      expect(res.data.title).toBe('Inspeção Hidráulica - Bloco B');
    });
  });

  describe('Conclusão com Parecer Técnico Obrigatório', () => {
    it('deve EXIGIR parecer técnico / laudo da inspeção para concluir a vistoria', async () => {
      mockPrismaService.agendaVistoria.findUnique.mockResolvedValue({
        id: 'vis-10',
        titulo: 'Vistoria Estrutural',
        subtitulo: 'EMEF Santos Dumont',
        concluido: false,
        laudo_tecnico: null,
      });

      await expect(
        service.complete('vis-10', { concluido: true, laudoTecnico: '   ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve concluir a vistoria com sucesso e registrar o laudo técnico', async () => {
      mockPrismaService.agendaVistoria.findUnique.mockResolvedValue({
        id: 'vis-10',
        titulo: 'Vistoria Estrutural',
        subtitulo: 'EMEF Santos Dumont',
        concluido: false,
        recorrencia: 'UNICA',
      });

      mockPrismaService.agendaVistoria.update.mockResolvedValue({
        id: 'vis-10',
        titulo: 'Vistoria Estrutural',
        subtitulo: 'EMEF Santos Dumont',
        concluido: true,
        laudo_tecnico: 'Telhado com pequenas trincas no caibro 4. Aprovado reparo pontual.',
        fotos_vistoria: ['https://exemplo.com/laudo.jpg'],
        recorrencia: 'UNICA',
        criado_em: new Date(),
      });

      const res = await service.complete(
        'vis-10',
        {
          concluido: true,
          laudoTecnico: 'Telhado com pequenas trincas no caibro 4. Aprovado reparo pontual.',
          fotosVistoria: ['https://exemplo.com/laudo.jpg'],
        },
        { id: 'tec-1', role: 'TECNICO' },
      );

      expect(res.success).toBe(true);
      expect(res.data.isCompleted).toBe(true);
      expect(res.data.laudoTecnico).toContain('Telhado com pequenas trincas');
      expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            acao: AuditAction.UPDATE,
            entidade_afetada: 'AgendaVistoria',
          }),
        }),
      );
    });
  });

  describe('Human-in-the-Loop na Ordem de Serviço (Opção B)', () => {
    it('deve sugerir a próxima etapa ao Gestor sem forçar alteração cega do ciclo da OS', async () => {
      mockPrismaService.agendaVistoria.findUnique.mockResolvedValue({
        id: 'vis-os',
        titulo: 'Vistoria Prévia',
        subtitulo: 'EMEF Santos Dumont',
        concluido: false,
        recorrencia: 'UNICA',
        ordem_servico: {
          id: 'os-123',
          codigo: 'OS-554433',
        },
      });

      mockPrismaService.agendaVistoria.update.mockResolvedValue({
        id: 'vis-os',
        titulo: 'Vistoria Prévia',
        subtitulo: 'EMEF Santos Dumont',
        concluido: true,
        laudo_tecnico: 'Necessário troca de 2 válvulas de descarga hidra.',
        recorrencia: 'UNICA',
        ordem_servico: {
          id: 'os-123',
          codigo: 'OS-554433',
        },
        criado_em: new Date(),
      });

      const res = await service.complete('vis-os', {
        concluido: true,
        laudoTecnico: 'Necessário troca de 2 válvulas de descarga hidra.',
      });

      expect(res.success).toBe(true);
      expect(res.data.proximaEtapaSugerida).toBeDefined();
      expect(res.data.proximaEtapaSugerida).toContain('OS-554433');
      expect(res.data.proximaEtapaSugerida).toContain('Sugestão para o Gestor');
    });
  });

  describe('Manutenção Preventiva Recorrente', () => {
    it('deve agendar automaticamente o próximo ciclo quando uma vistoria recorrente for concluída', async () => {
      const dataBase = new Date('2026-10-01T09:00:00Z');
      mockPrismaService.agendaVistoria.findUnique.mockResolvedValue({
        id: 'vis-rec',
        titulo: 'Inspeção de Caixa d Água',
        subtitulo: 'EMEF Paulo Freire',
        horario: '08:30',
        data_agendada: dataBase,
        tipo: 'hidraulica',
        recorrencia: 'TRIMESTRAL', // Recorrência trimestral (+90 dias)
        concluido: false,
        tecnico: 'Carlos Técnico',
        predio_id: 'pred-1',
      });

      mockPrismaService.agendaVistoria.update.mockResolvedValue({
        id: 'vis-rec',
        titulo: 'Inspeção de Caixa d Água',
        subtitulo: 'EMEF Paulo Freire',
        horario: '08:30',
        data_agendada: dataBase,
        tipo: 'hidraulica',
        recorrencia: 'TRIMESTRAL',
        concluido: true,
        laudo_tecnico: 'Limpeza e desinfecção efetuadas com sucesso.',
        criado_em: dataBase,
      });

      let novoCicloData: any = null;
      mockPrismaService.agendaVistoria.create.mockImplementation(async ({ data }) => {
        novoCicloData = data;
        return { id: 'vis-novo-ciclo', ...data, criado_em: new Date() };
      });

      await service.complete('vis-rec', {
        concluido: true,
        laudoTecnico: 'Limpeza e desinfecção efetuadas com sucesso.',
      });

      expect(mockPrismaService.agendaVistoria.create).toHaveBeenCalled();
      expect(novoCicloData.titulo).toContain('(Ciclo Preventivo)');
      expect(novoCicloData.recorrencia).toBe('TRIMESTRAL');
      // Próxima data deve ser 90 dias após dataBase
      const diffDias = Math.round(
        (novoCicloData.data_agendada.getTime() - dataBase.getTime()) / (24 * 3600 * 1000),
      );
      expect(diffDias).toBe(90);
    });
  });
});

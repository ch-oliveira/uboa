import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersService } from './work-orders.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StatusOS, Prioridade, Role } from '@repo/database';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('WorkOrdersService - Ciclo de Vida da OS', () => {
  let service: WorkOrdersService;

  const mockPrismaService = {
    ordemServico: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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
});

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
});

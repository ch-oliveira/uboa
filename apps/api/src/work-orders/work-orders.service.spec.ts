import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersService } from './work-orders.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('WorkOrdersService', () => {
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
    auditoriaLog: {
      create: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WorkOrdersService>(WorkOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

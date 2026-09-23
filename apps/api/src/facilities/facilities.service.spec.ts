import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesService } from './facilities.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('FacilitiesService', () => {
  let service: FacilitiesService;

  const mockPrismaService = {
    predio: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    usuario: {
      findFirst: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilitiesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FacilitiesService>(FacilitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

describe('AppController', () => {
  let appController: AppController;

  const mockPrismaService = {
    usuario: { count: vi.fn().mockResolvedValue(0) },
    predio: { count: vi.fn().mockResolvedValue(0) },
    ordemServico: { count: vi.fn().mockResolvedValue(0) },
    agendaVistoria: { count: vi.fn().mockResolvedValue(0) },
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should return operational status', async () => {
      const result = await appController.getStatus();
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('online');
    });
  });
});

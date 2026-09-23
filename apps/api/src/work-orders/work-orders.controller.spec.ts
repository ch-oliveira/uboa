import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkOrdersController } from './work-orders.controller.js';
import { WorkOrdersService } from './work-orders.service.js';

describe('WorkOrdersController', () => {
  let controller: WorkOrdersController;

  const mockWorkOrdersService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkOrdersController],
      providers: [
        { provide: WorkOrdersService, useValue: mockWorkOrdersService },
      ],
    }).compile();

    controller = module.get<WorkOrdersController>(WorkOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

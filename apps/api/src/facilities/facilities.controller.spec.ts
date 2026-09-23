import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesController } from './facilities.controller.js';
import { FacilitiesService } from './facilities.service.js';

describe('FacilitiesController', () => {
  let controller: FacilitiesController;

  const mockFacilitiesService = {
    findAll: vi.fn(),
    create: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilitiesController],
      providers: [
        { provide: FacilitiesService, useValue: mockFacilitiesService },
      ],
    }).compile();

    controller = module.get<FacilitiesController>(FacilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

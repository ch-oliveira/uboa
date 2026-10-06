import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesService } from './facilities.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TipoPredio, AuditAction } from '@repo/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FacilitiesService - Gestão de Unidades e Auditoria Municipal', () => {
  let service: FacilitiesService;

  const mockPrismaService = {
    predio: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    usuario: {
      findFirst: vi.fn(),
    },
    auditoriaLog: {
      create: vi.fn(),
    },
    $executeRawUnsafe: vi.fn().mockResolvedValue(1),
    $transaction: vi.fn().mockImplementation(async (callback) => {
      return callback({
        predio: mockPrismaService.predio,
        auditoriaLog: mockPrismaService.auditoriaLog,
        $executeRawUnsafe: mockPrismaService.$executeRawUnsafe,
      });
    }),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacilitiesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FacilitiesService>(FacilitiesService);
  });

  describe('Criação de Unidades (create)', () => {
    it('deve criar uma unidade com campos municipais e registrar auditoria', async () => {
      mockPrismaService.usuario.findFirst.mockResolvedValue({ id: 'gestor-1', nome: 'Mariana Gestora' });
      mockPrismaService.predio.create.mockResolvedValue({
        id: 'pred-10',
        nome: 'EMEF Santos Dumont',
        tipo: TipoPredio.ESCOLA,
        setor: 'Secretaria Municipal de Educação',
        porte: 'GRANDE',
        capacidade: 800,
        endereco: 'Rua Santos Dumont, 100',
        latitude: -23.5505,
        longitude: -46.6333,
        ativo: true,
        gestor_id: 'gestor-1',
        gestor: { nome: 'Mariana Gestora', telefone: '11999999999' },
        ordens_servico: [],
      });

      const res = await service.create(
        {
          nome: 'EMEF Santos Dumont',
          tipo: 'ESCOLA',
          setor: 'Secretaria Municipal de Educação',
          porte: 'GRANDE',
          capacidade: 800,
          endereco: 'Rua Santos Dumont, 100',
          latitude: -23.5505,
          longitude: -46.6333,
        },
        { id: 'admin-1', role: 'ADMIN' },
      );

      expect(res.success).toBe(true);
      expect(res.data.name).toBe('EMEF Santos Dumont');
      expect(res.data.setor).toBe('Secretaria Municipal de Educação');
      expect(res.data.porte).toBe('GRANDE');
      expect(res.data.capacidade).toBe(800);
      expect(res.data.latitude).toBe(-23.5505);
      expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('ST_SetSRID(ST_MakePoint'),
        -46.6333,
        -23.5505,
        'pred-10',
      );
      expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            entidade_afetada: 'Predio',
            entidade_id: 'pred-10',
            acao: AuditAction.CREATE,
          }),
        }),
      );
    });

    it('deve exigir nome obrigatório para a unidade pública', async () => {
      await expect(service.create({ nome: '   ' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('Atualização e Desativação (update)', () => {
    it('deve exigir justificativa obrigatória para desativar unidade (Tribunal de Contas)', async () => {
      mockPrismaService.predio.findUnique.mockResolvedValue({
        id: 'pred-1',
        nome: 'UBS Central',
        ativo: true,
        tipo: TipoPredio.UBS,
      });

      await expect(
        service.update('pred-1', { ativo: false }, { id: 'admin-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve desativar com sucesso quando a justificativa de desativação for fornecida', async () => {
      mockPrismaService.predio.findUnique.mockResolvedValue({
        id: 'pred-1',
        nome: 'UBS Central',
        ativo: true,
        tipo: TipoPredio.UBS,
      });

      mockPrismaService.predio.update.mockResolvedValue({
        id: 'pred-1',
        nome: 'UBS Central',
        tipo: TipoPredio.UBS,
        ativo: false,
        motivo_desativacao: 'Reforma geral e transferência provisória para UBS Anexa',
        ordens_servico: [],
      });

      const res = await service.update(
        'pred-1',
        {
          ativo: false,
          motivoDesativacao: 'Reforma geral e transferência provisória para UBS Anexa',
        },
        { id: 'admin-1' },
      );

      expect(res.success).toBe(true);
      expect(res.data.ativo).toBe(false);
      expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            acao: AuditAction.UPDATE,
            entidade_id: 'pred-1',
          }),
        }),
      );
    });
  });

  describe('Preservação Histórica e Bloqueio de Exclusão (remove)', () => {
    it('deve BLOQUEAR estritamente a exclusão se houver histórico de Ordens de Serviço (Tribunal de Contas)', async () => {
      mockPrismaService.predio.findUnique.mockResolvedValue({
        id: 'pred-escola',
        nome: 'EMEF Paulo Freire',
        ordens_servico: [
          { id: 'os-1', codigo: 'OS-100001' },
          { id: 'os-2', codigo: 'OS-100002' },
        ],
      });

      await expect(service.remove('pred-escola', { id: 'admin-1' })).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPrismaService.predio.delete).not.toHaveBeenCalled();
    });

    it('deve permitir a exclusão de unidade sem histórico de Ordens de Serviço', async () => {
      mockPrismaService.predio.findUnique.mockResolvedValue({
        id: 'pred-vazio',
        nome: 'Terreno em Prospecção',
        ordens_servico: [],
      });

      const res = await service.remove('pred-vazio', { id: 'admin-1' });
      expect(res.success).toBe(true);
      expect(res.data.deleted).toBe(true);
      expect(mockPrismaService.predio.delete).toHaveBeenCalledWith({
        where: { id: 'pred-vazio' },
      });
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role, AuditAction } from '@repo/database';
import { ForbiddenException, ConflictException } from '@nestjs/common';
import bcrypt from 'bcryptjs';

describe('UsersService - RBAC, Auditoria e Invalidação de Sessão', () => {
  let service: UsersService;

  const mockPrismaService = {
    usuario: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditoriaLog: {
      create: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('Criação de Usuários (RBAC)', () => {
    it('deve impedir GESTOR de criar usuários com perfil ADMIN', async () => {
      await expect(
        service.create(
          {
            nome: 'Novo Admin',
            email: 'admin@zelo.gov.br',
            senha: 'password123',
            role: Role.ADMIN,
          },
          { id: 'gestor-1', role: Role.GESTOR },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve impedir GESTOR de criar usuários com perfil GESTOR', async () => {
      await expect(
        service.create(
          {
            nome: 'Outro Gestor',
            email: 'gestor2@zelo.gov.br',
            senha: 'password123',
            role: Role.GESTOR,
          },
          { id: 'gestor-1', role: Role.GESTOR },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir GESTOR criar TECNICO ou SOLICITANTE', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.usuario.create.mockResolvedValue({
        id: 'tec-1',
        nome: 'Carlos Técnico',
        email: 'carlos@zelo.gov.br',
        role: Role.TECNICO,
        telefone: '11999999999',
        especialidade: 'ELETRICA',
        ativo: true,
        token_version: 1,
        criado_em: new Date(),
      });

      const res = await service.create(
        {
          nome: 'Carlos Técnico',
          email: 'carlos@zelo.gov.br',
          senha: 'password123',
          role: Role.TECNICO,
          especialidade: 'ELETRICA',
        },
        { id: 'gestor-1', role: Role.GESTOR },
      );

      expect(res.success).toBe(true);
      expect(res.data.role).toBe(Role.TECNICO);
      expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            acao: AuditAction.CREATE,
            usuario_id: 'gestor-1',
          }),
        }),
      );
    });

    it('deve permitir ADMIN criar qualquer perfil', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.usuario.create.mockResolvedValue({
        id: 'gest-1',
        nome: 'Nova Gestora',
        email: 'gestora@zelo.gov.br',
        role: Role.GESTOR,
        ativo: true,
        token_version: 1,
        criado_em: new Date(),
      });

      const res = await service.create(
        {
          nome: 'Nova Gestora',
          email: 'gestora@zelo.gov.br',
          senha: 'password123',
          role: Role.GESTOR,
        },
        { id: 'admin-1', role: Role.ADMIN },
      );

      expect(res.success).toBe(true);
      expect(res.data.role).toBe(Role.GESTOR);
    });
  });

  describe('Atualização de Usuários e Invalidação de Sessão (token_version)', () => {
    it('deve impedir GESTOR de modificar dados de um ADMIN ou outro GESTOR', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'admin-alvo',
        nome: 'Admin Master',
        email: 'admin@zelo.gov.br',
        role: Role.ADMIN,
        ativo: true,
      });

      await expect(
        service.update(
          'admin-alvo',
          { nome: 'Tentativa de Mudança' },
          { id: 'gestor-1', role: Role.GESTOR },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve impedir GESTOR de promover usuário comum para ADMIN ou GESTOR', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'tec-1',
        nome: 'Técnico Silva',
        email: 'silva@zelo.gov.br',
        role: Role.TECNICO,
        ativo: true,
      });

      await expect(
        service.update(
          'tec-1',
          { role: Role.ADMIN },
          { id: 'gestor-1', role: Role.GESTOR },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve incrementar token_version ao alterar a senha do usuário', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'usr-1',
        nome: 'Joao',
        email: 'joao@zelo.gov.br',
        role: Role.SOLICITANTE,
        ativo: true,
        token_version: 1,
      });

      mockPrismaService.usuario.update.mockResolvedValue({
        id: 'usr-1',
        nome: 'Joao',
        email: 'joao@zelo.gov.br',
        role: Role.SOLICITANTE,
        ativo: true,
        token_version: 2,
        criado_em: new Date(),
      });

      await service.update(
        'usr-1',
        { senha: 'novaSenhaSegura123' },
        { id: 'admin-1', role: Role.ADMIN },
      );

      expect(mockPrismaService.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-1' },
          data: expect.objectContaining({
            token_version: { increment: 1 },
          }),
        }),
      );
    });

    it('deve incrementar token_version ao alterar o perfil/role do usuário', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'usr-2',
        nome: 'Maria',
        email: 'maria@zelo.gov.br',
        role: Role.SOLICITANTE,
        ativo: true,
        token_version: 1,
      });

      mockPrismaService.usuario.update.mockResolvedValue({
        id: 'usr-2',
        nome: 'Maria',
        email: 'maria@zelo.gov.br',
        role: Role.TECNICO,
        ativo: true,
        token_version: 2,
        criado_em: new Date(),
      });

      await service.update(
        'usr-2',
        { role: Role.TECNICO },
        { id: 'admin-1', role: Role.ADMIN },
      );

      expect(mockPrismaService.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-2' },
          data: expect.objectContaining({
            role: Role.TECNICO,
            token_version: { increment: 1 },
          }),
        }),
      );
    });

    it('deve incrementar token_version e registrar auditoria ao bloquear usuário (ativo: false)', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'usr-3',
        nome: 'Suspeito',
        email: 'suspeito@zelo.gov.br',
        role: Role.TECNICO,
        ativo: true,
        token_version: 3,
      });

      mockPrismaService.usuario.update.mockResolvedValue({
        id: 'usr-3',
        nome: 'Suspeito',
        email: 'suspeito@zelo.gov.br',
        role: Role.TECNICO,
        ativo: false,
        token_version: 4,
        criado_em: new Date(),
      });

      await service.update(
        'usr-3',
        { ativo: false },
        { id: 'admin-1', role: Role.ADMIN },
      );

      expect(mockPrismaService.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'usr-3' },
          data: expect.objectContaining({
            ativo: false,
            token_version: { increment: 1 },
          }),
        }),
      );

      expect(mockPrismaService.auditoriaLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            acao: AuditAction.UPDATE,
            entidade_afetada: 'Usuario',
            entidade_id: 'usr-3',
            usuario_id: 'admin-1',
          }),
        }),
      );
    });

    it('NÃO deve incrementar token_version em atualização cadastral simples (ex.: telefone)', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue({
        id: 'usr-4',
        nome: 'Ana',
        email: 'ana@zelo.gov.br',
        role: Role.SOLICITANTE,
        ativo: true,
        token_version: 1,
      });

      mockPrismaService.usuario.update.mockResolvedValue({
        id: 'usr-4',
        nome: 'Ana',
        email: 'ana@zelo.gov.br',
        role: Role.SOLICITANTE,
        telefone: '11988887777',
        ativo: true,
        token_version: 1,
        criado_em: new Date(),
      });

      await service.update(
        'usr-4',
        { telefone: '11988887777' },
        { id: 'gestor-1', role: Role.GESTOR },
      );

      expect(mockPrismaService.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            token_version: expect.anything(),
          }),
        }),
      );
    });
  });
});

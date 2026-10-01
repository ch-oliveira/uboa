import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@repo/database';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    usuario: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  };

  const mockJwtService = {
    signAsync: vi.fn().mockResolvedValue('signed_mock_jwt_token'),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject login when password is missing or empty', async () => {
    await expect(service.login('admin@urboa.gov.br', '')).rejects.toThrow(UnauthorizedException);
    await expect(service.login('admin@urboa.gov.br', undefined)).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login when email is missing', async () => {
    await expect(service.login('', '123')).rejects.toThrow(UnauthorizedException);
  });

  it('should reject login when user does not exist', async () => {
    mockPrismaService.usuario.findFirst.mockResolvedValue(null);
    await expect(service.login('inexistente@urboa.gov.br', 'senha-mock-inexistente-123')).rejects.toThrow(UnauthorizedException);
  });

  it('should authenticate correctly with valid bcrypt password and return signed JWT', async () => {
    const mockTestPassword = 'mock-unit-test-password-456!';
    const passwordHash = await bcrypt.hash(mockTestPassword, 10);
    mockPrismaService.usuario.findFirst.mockResolvedValue({
      id: 'user-admin',
      nome: 'Desenvolvedor / Admin',
      email: 'admin@urboa.gov.br',
      senha_hash: passwordHash,
      role: Role.ADMIN,
      telefone: '(11) 99999-0000',
    });

    const result = await service.login('admin@urboa.gov.br', mockTestPassword);
    expect(result.success).toBe(true);
    expect(result.data.token).toBe('signed_mock_jwt_token');
    expect(result.data.user.email).toBe('admin@urboa.gov.br');
    expect(mockJwtService.signAsync).toHaveBeenCalled();
  });

  it('should revoke session by incrementing token_version', async () => {
    mockPrismaService.usuario.update.mockResolvedValue({ id: 'user-admin', token_version: 2 });
    await service.revokeSession('user-admin');
    expect(mockPrismaService.usuario.update).toHaveBeenCalledWith({
      where: { id: 'user-admin' },
      data: { token_version: { increment: 1 } },
    });
  });
});

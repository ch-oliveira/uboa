import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException, ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtStrategy, JwtPayload } from './jwt.strategy.js';
import { RolesGuard } from './roles.guard.js';
import { Role } from '@repo/database';

describe('Security & RBAC Enforcement Suite', () => {
  let jwtStrategy: JwtStrategy;
  let rolesGuard: RolesGuard;
  let mockPrisma: any;
  let reflector: Reflector;

  beforeEach(() => {
    mockPrisma = {
      usuario: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    };

    reflector = new Reflector();
    jwtStrategy = new JwtStrategy(mockPrisma);
    rolesGuard = new RolesGuard(reflector);
  });

  describe('JWT Session & Revocation (tokenVersion)', () => {
    it('should validate successfully when tokenVersion matches user token_version', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue({
        id: 'usr-1',
        nome: 'Gestor Municipal',
        email: 'gestor@urboa.gov.br',
        role: Role.GESTOR,
        token_version: 1,
        predios_geridos: [],
      });

      const payload: JwtPayload = {
        sub: 'usr-1',
        email: 'gestor@urboa.gov.br',
        role: Role.GESTOR,
        tokenVersion: 1,
      };

      const user = await jwtStrategy.validate(payload);
      expect(user).toBeDefined();
      expect(user.id).toBe('usr-1');
      expect(user.email).toBe('gestor@urboa.gov.br');
    });

    it('should reject session when tokenVersion is mismatched (session revoked / logged out)', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue({
        id: 'usr-1',
        nome: 'Gestor Municipal',
        email: 'gestor@urboa.gov.br',
        role: Role.GESTOR,
        token_version: 2, // Invalidação ocorrida no logout
        predios_geridos: [],
      });

      const payload: JwtPayload = {
        sub: 'usr-1',
        email: 'gestor@urboa.gov.br',
        role: Role.GESTOR,
        tokenVersion: 1, // Token emitido antes do logout
      };

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('should reject when user does not exist in database', async () => {
      mockPrisma.usuario.findUnique.mockResolvedValue(null);

      const payload: JwtPayload = {
        sub: 'usr-nonexistent',
        email: 'fake@urboa.gov.br',
        role: Role.ADMIN,
      };

      await expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('RolesGuard & Access Control Matrix (RBAC)', () => {
    function createMockContext(userRole?: Role): ExecutionContext {
      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({
            user: userRole ? { id: 'usr-test', role: userRole } : undefined,
          }),
        }),
      } as any;
    }

    it('should allow access when endpoint does not require specific roles', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext(Role.TECNICO);
      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should allow access when user role matches required roles', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN, Role.GESTOR]);
      const context = createMockContext(Role.ADMIN);
      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('should forbid access (403) when user role does not match required roles', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN, Role.GESTOR]);
      const context = createMockContext(Role.TECNICO);
      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should forbid access (403) when user is not present on protected role route', () => {
      vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.ADMIN]);
      const context = createMockContext(undefined);
      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});

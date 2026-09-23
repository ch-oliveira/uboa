import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';

export interface AuthenticatedUserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
  facilityName?: string;
  avatar: string;
}

export interface AuthSessionResponse {
  user: AuthenticatedUserResponse;
  token: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private mapAuthUser(user: any): AuthenticatedUserResponse {
    return {
      id: user.id,
      name: user.nome,
      email: user.email,
      role: user.role,
      phoneNumber: user.telefone || undefined,
      facilityName: user.role === Role.SOLICITANTE ? (user.predios_geridos?.[0]?.nome || 'EMEF Paulo Freire') : undefined,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(user.nome)}`,
    };
  }

  async login(email?: string, password?: string, quickRole?: string): Promise<ApiResponse<AuthSessionResponse>> {
    // 1. Login Rápido por Perfil (1-clique demo)
    if (quickRole) {
      let targetEmail = 'gestor@zelo.gov.br';
      if (quickRole === 'ADMIN') targetEmail = 'admin@zelo.gov.br';
      else if (quickRole === 'TECNICO') targetEmail = 'carlos.tecnico@zelo.gov.br';
      else if (quickRole === 'SOLICITANTE_ESCOLA' || quickRole === 'SOLICITANTE') targetEmail = 'maria.escola@zelo.gov.br';
      else if (quickRole === 'SOLICITANTE_UBS') targetEmail = 'marcelo.ubs@zelo.gov.br';

      let user = await this.prisma.usuario.findUnique({
        where: { email: targetEmail },
        include: { predios_geridos: true },
      });

      if (!user && targetEmail === 'admin@zelo.gov.br') {
        try {
          user = await this.prisma.usuario.upsert({
            where: { email: 'admin@zelo.gov.br' },
            update: {},
            create: {
              id: 'user-admin',
              nome: 'Desenvolvedor / Admin',
              email: 'admin@zelo.gov.br',
              senha_hash: '123',
              role: Role.ADMIN,
              telefone: '(11) 99999-0000',
            },
            include: { predios_geridos: true },
          });
        } catch {
          // ignora
        }
      }

      if (!user) {
        throw new UnauthorizedException('Perfil de demonstração não encontrado na base de dados.');
      }

      const mapped = this.mapAuthUser(user);
      const token = `zelo_jwt_token_${user.id}_${Date.now()}`;

      return {
        success: true,
        data: {
          user: mapped,
          token,
        },
        message: 'Autenticação realizada com sucesso.',
      };
    }

    // 2. Login Tradicional por E-mail e Senha
    if (!email) {
      throw new UnauthorizedException('E-mail institucional é obrigatório.');
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await this.prisma.usuario.findUnique({
      where: { email: cleanEmail },
      include: { predios_geridos: true },
    });

    if (!user && cleanEmail === 'admin@zelo.gov.br') {
      try {
        user = await this.prisma.usuario.upsert({
          where: { email: 'admin@zelo.gov.br' },
          update: {},
          create: {
            id: 'user-admin',
            nome: 'Desenvolvedor / Admin',
            email: 'admin@zelo.gov.br',
            senha_hash: '123',
            role: Role.ADMIN,
            telefone: '(11) 99999-0000',
          },
          include: { predios_geridos: true },
        });
      } catch {
        // ignora
      }
    }

    if (!user || (password && user.senha_hash !== password)) {
      throw new UnauthorizedException('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    const mapped = this.mapAuthUser(user);
    const token = `zelo_jwt_token_${user.id}_${Date.now()}`;

    return {
      success: true,
      data: {
        user: mapped,
        token,
      },
      message: 'Autenticação realizada com sucesso.',
    };
  }

  async getMe(userId: string): Promise<ApiResponse<AuthenticatedUserResponse>> {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { predios_geridos: true },
    });

    if (!user) {
      throw new UnauthorizedException('Sessão expirada ou usuário não encontrado.');
    }

    return {
      success: true,
      data: this.mapAuthUser(user),
    };
  }
}

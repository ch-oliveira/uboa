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
      if (quickRole === 'TECNICO') targetEmail = 'carlos.tecnico@zelo.gov.br';
      else if (quickRole === 'SOLICITANTE_ESCOLA' || quickRole === 'SOLICITANTE') targetEmail = 'maria.escola@zelo.gov.br';
      else if (quickRole === 'SOLICITANTE_UBS') targetEmail = 'marcelo.ubs@zelo.gov.br';

      const user = await this.prisma.usuario.findUnique({
        where: { email: targetEmail },
        include: { predios_geridos: true },
      });

      if (!user) {
        throw new UnauthorizedException('Demo profile not found in database.');
      }

      const mapped = this.mapAuthUser(user);
      const token = `zelo_jwt_token_${user.id}_${Date.now()}`;

      return {
        success: true,
        data: {
          user: mapped,
          token,
        },
        message: 'Authentication successful.',
      };
    }

    // 2. Login Tradicional por E-mail e Senha
    if (!email) {
      throw new UnauthorizedException('Email is required.');
    }

    const user = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { predios_geridos: true },
    });

    if (!user || (password && user.senha_hash !== password)) {
      throw new UnauthorizedException('Invalid credentials. Default password: 123');
    }

    const mapped = this.mapAuthUser(user);
    const token = `zelo_jwt_token_${user.id}_${Date.now()}`;

    return {
      success: true,
      data: {
        user: mapped,
        token,
      },
      message: 'Authentication successful.',
    };
  }

  async getMe(userId: string): Promise<ApiResponse<AuthenticatedUserResponse>> {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: { predios_geridos: true },
    });

    if (!user) {
      throw new UnauthorizedException('Session expired or user not found.');
    }

    return {
      success: true,
      data: this.mapAuthUser(user),
    };
  }
}

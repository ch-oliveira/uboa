import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';
import type { JwtPayload } from './jwt.strategy.js';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public mapAuthUser(user: any): AuthenticatedUserResponse {
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

  async login(email?: string, password?: string): Promise<ApiResponse<AuthSessionResponse>> {
    if (!email || typeof email !== 'string' || !email.trim()) {
      throw new UnauthorizedException('E-mail institucional é obrigatório.');
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      throw new UnauthorizedException('Senha de acesso é obrigatória.');
    }

    const cleanEmail = email.toLowerCase().trim();
    const urboaEmail = cleanEmail.replace(/@zelo\.gov\.br$/i, '@urboa.gov.br');
    const user = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { email: urboaEmail },
          { email: cleanEmail },
        ],
      },
      include: { predios_geridos: true },
    });

    if (!user) {
      // Mensagem genérica para prevenir enumeração de usuários
      throw new UnauthorizedException('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    const isMatch = await bcrypt.compare(password, user.senha_hash);

    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.token_version,
    };

    const token = await this.jwtService.signAsync(payload);
    const mapped = this.mapAuthUser(user);

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

  async revokeSession(userId: string): Promise<void> {
    await this.prisma.usuario.update({
      where: { id: userId },
      data: {
        token_version: { increment: 1 },
      },
    });
  }
}

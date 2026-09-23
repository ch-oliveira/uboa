import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
  createdAt: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private mapUser(u: any): UserResponse {
    return {
      id: u.id,
      name: u.nome,
      email: u.email,
      role: u.role,
      phoneNumber: u.telefone || undefined,
      createdAt: u.criado_em.toISOString(),
    };
  }

  async findAll(role?: string): Promise<ApiResponse<UserResponse[]>> {
    const where: any = {};
    if (role && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    const users = await this.prisma.usuario.findMany({
      where,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        telefone: true,
        criado_em: true,
      },
      orderBy: { nome: 'asc' },
    });

    const data = users.map((u: any) => this.mapUser(u));

    return {
      success: true,
      data,
      meta: {
        total: data.length,
      },
    };
  }

  async findOne(id: string): Promise<ApiResponse<UserResponse>> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        telefone: true,
        criado_em: true,
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    return {
      success: true,
      data: this.mapUser(user),
    };
  }
}

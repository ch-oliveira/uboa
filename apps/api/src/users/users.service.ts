import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { JwtPayload } from '../auth/jwt.strategy.js';

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

  async create(dto: CreateUserDto): Promise<ApiResponse<UserResponse>> {
    const cleanEmail = dto.email.toLowerCase().trim();
    const existing = await this.prisma.usuario.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      throw new ConflictException('Já existe um usuário com este e-mail.');
    }

    const passwordHash = await bcrypt.hash(dto.senha, 10);
    const user = await this.prisma.usuario.create({
      data: {
        nome: dto.nome.trim(),
        email: cleanEmail,
        senha_hash: passwordHash,
        role: dto.role || Role.GESTOR,
        telefone: dto.telefone?.trim(),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        telefone: true,
        criado_em: true,
      },
    });

    return {
      success: true,
      data: this.mapUser(user),
      message: 'Usuário cadastrado com sucesso.',
    };
  }
}

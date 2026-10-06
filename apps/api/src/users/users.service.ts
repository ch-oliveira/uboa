import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';
import { Role, AuditAction } from '@repo/database';
import type { ApiResponse } from '../common/interfaces/api-response.interface.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
  especialidade?: string;
  active: boolean;
  tokenVersion: number;
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
      especialidade: u.especialidade || undefined,
      active: u.ativo !== false,
      tokenVersion: u.token_version,
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
        especialidade: true,
        ativo: true,
        token_version: true,
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
        especialidade: true,
        ativo: true,
        token_version: true,
        criado_em: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return {
      success: true,
      data: this.mapUser(user),
    };
  }

  async create(dto: CreateUserDto, currentUser?: any): Promise<ApiResponse<UserResponse>> {
    const cleanEmail = dto.email.toLowerCase().trim();
    const targetRole = dto.role || Role.SOLICITANTE;

    // RBAC: Gestor só tem permissão para cadastrar TECNICO ou SOLICITANTE
    if (currentUser?.role === Role.GESTOR) {
      if (targetRole === Role.ADMIN || targetRole === Role.GESTOR) {
        throw new ForbiddenException(
          'Gestores só podem cadastrar Técnicos ou Solicitantes. Criação de Administradores ou Gestores é exclusiva de ADMIN.',
        );
      }
    }

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
        role: targetRole,
        telefone: dto.telefone?.trim(),
        especialidade: dto.especialidade?.trim()?.toUpperCase() || (targetRole === Role.TECNICO ? 'GERAL' : undefined),
        ativo: true,
        token_version: 1,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        telefone: true,
        especialidade: true,
        ativo: true,
        token_version: true,
        criado_em: true,
      },
    });

    if (currentUser?.id) {
      await this.prisma.auditoriaLog.create({
        data: {
          entidade_afetada: 'Usuario',
          entidade_id: user.id,
          acao: AuditAction.CREATE,
          usuario_id: currentUser.id,
          dados_novos: {
            nome: user.nome,
            email: user.email,
            role: user.role,
          },
        },
      });
    }

    return {
      success: true,
      data: this.mapUser(user),
      message: 'Usuário cadastrado com sucesso.',
    };
  }

  async update(id: string, dto: UpdateUserDto, currentUser?: any): Promise<ApiResponse<UserResponse>> {
    const targetUser = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // RBAC: Se o operador for GESTOR
    if (currentUser?.role === Role.GESTOR) {
      // Não pode modificar usuários com perfil ADMIN ou GESTOR
      if (targetUser.role === Role.ADMIN || targetUser.role === Role.GESTOR) {
        throw new ForbiddenException('Gestores não têm permissão para modificar usuários com perfil ADMIN ou GESTOR.');
      }
      // Não pode promover ninguém para ADMIN ou GESTOR
      if (dto.role && (dto.role === Role.ADMIN || dto.role === Role.GESTOR)) {
        throw new ForbiddenException('Gestores não têm permissão para promover usuários a ADMIN ou GESTOR.');
      }
    }

    const updateData: any = {};
    let shouldRevokeTokens = false;

    if (dto.nome && dto.nome.trim()) {
      updateData.nome = dto.nome.trim();
    }

    if (dto.email && dto.email.trim()) {
      const cleanEmail = dto.email.toLowerCase().trim();
      if (cleanEmail !== targetUser.email) {
        const existing = await this.prisma.usuario.findUnique({
          where: { email: cleanEmail },
        });
        if (existing) {
          throw new ConflictException('Já existe outro usuário com este e-mail.');
        }
        updateData.email = cleanEmail;
      }
    }

    if (dto.telefone !== undefined) {
      updateData.telefone = dto.telefone?.trim() || null;
    }

    if (dto.especialidade !== undefined) {
      updateData.especialidade = dto.especialidade?.trim()?.toUpperCase() || null;
    }

    // 1. Alteração ou redefinição de senha -> força incremento imediato de token_version
    if (dto.senha && dto.senha.trim()) {
      updateData.senha_hash = await bcrypt.hash(dto.senha, 10);
      shouldRevokeTokens = true;
    }

    // 2. Mudança de perfil/role -> força incremento imediato de token_version
    if (dto.role && dto.role !== targetUser.role) {
      updateData.role = dto.role;
      shouldRevokeTokens = true;
    }

    // 3. Bloqueio administrativo do usuário -> força incremento imediato de token_version
    if (dto.ativo !== undefined && dto.ativo !== targetUser.ativo) {
      updateData.ativo = dto.ativo;
      if (dto.ativo === false) {
        shouldRevokeTokens = true;
      }
    }

    if (shouldRevokeTokens) {
      updateData.token_version = { increment: 1 };
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        telefone: true,
        especialidade: true,
        ativo: true,
        token_version: true,
        criado_em: true,
      },
    });

    if (currentUser?.id) {
      await this.prisma.auditoriaLog.create({
        data: {
          entidade_afetada: 'Usuario',
          entidade_id: updatedUser.id,
          acao: AuditAction.UPDATE,
          usuario_id: currentUser.id,
          dados_antigos: {
            role: targetUser.role,
            ativo: targetUser.ativo,
            token_version: targetUser.token_version,
          },
          dados_novos: {
            role: updatedUser.role,
            ativo: updatedUser.ativo,
            token_version: updatedUser.token_version,
            senha_alterada: !!dto.senha,
          },
        },
      });
    }

    return {
      success: true,
      data: this.mapUser(updatedUser),
      message: shouldRevokeTokens
        ? 'Usuário atualizado com sucesso. Sessões anteriores foram revogadas imediatamente.'
        : 'Usuário atualizado com sucesso.',
    };
  }
}

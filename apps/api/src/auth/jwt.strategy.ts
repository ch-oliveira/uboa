import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tokenVersion: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'urboa_dev_fallback_insecure_key_change_in_prod_32c',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { predios_geridos: true },
    });

    if (!user) {
      throw new UnauthorizedException('Sessão inválida ou usuário não encontrado.');
    }

    if (user.ativo === false) {
      throw new UnauthorizedException('Conta desativada ou bloqueada pela administração.');
    }

    if (user.token_version !== payload.tokenVersion) {
      throw new UnauthorizedException('Sessão revogada ou expirada. Faça login novamente.');
    }

    return {
      id: user.id,
      name: user.nome,
      email: user.email,
      role: user.role,
      phoneNumber: user.telefone || undefined,
      facilityName: user.predios_geridos?.[0]?.nome || undefined,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(user.nome)}`,
    };
  }
}

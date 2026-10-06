import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@repo/database';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEmail({}, { message: 'E-mail institucional inválido.' })
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres.' })
  @IsOptional()
  senha?: string;

  @IsEnum(Role, { message: 'Perfil inválido. Use ADMIN, GESTOR, TECNICO ou SOLICITANTE.' })
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  especialidade?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}

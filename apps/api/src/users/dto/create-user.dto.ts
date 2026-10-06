import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@repo/database';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  nome!: string;

  @IsEmail({}, { message: 'E-mail institucional inválido.' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve conter no mínimo 6 caracteres.' })
  senha!: string;

  @IsEnum(Role, { message: 'Perfil inválido. Use ADMIN, GESTOR, TECNICO ou SOLICITANTE.' })
  @IsOptional()
  role?: Role;

  @IsString()
  @IsOptional()
  telefone?: string;
}

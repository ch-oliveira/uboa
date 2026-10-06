import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
import { TipoPredio } from '@repo/database';

export class CreateFacilityDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  nome?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  setor?: string;

  @IsString()
  @IsOptional()
  porte?: string;

  @IsNumber()
  @IsOptional()
  capacidade?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  endereco?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  managerName?: string;

  @IsString()
  @IsOptional()
  gestor?: string;

  @IsString()
  @IsOptional()
  gestorId?: string;

  @IsString()
  @IsOptional()
  gestor_id?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  telefone?: string;
}

export class UpdateFacilityDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  nome?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  setor?: string;

  @IsString()
  @IsOptional()
  porte?: string;

  @IsNumber()
  @IsOptional()
  capacidade?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  endereco?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsString()
  @IsOptional()
  managerName?: string;

  @IsString()
  @IsOptional()
  gestor?: string;

  @IsString()
  @IsOptional()
  gestorId?: string;

  @IsString()
  @IsOptional()
  gestor_id?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @IsString()
  @IsOptional()
  motivoDesativacao?: string;

  @IsString()
  @IsOptional()
  motivo_desativacao?: string;
}

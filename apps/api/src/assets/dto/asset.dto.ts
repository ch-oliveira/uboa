import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAssetDto {
  @IsString()
  @MaxLength(60)
  codigoPatrimonio!: string;

  @IsString()
  @MaxLength(160)
  nome!: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsString()
  @MaxLength(120)
  ambiente!: string;

  @IsString()
  predioId!: string;

  @IsOptional()
  @IsString()
  marcaModelo?: string;

  @IsOptional()
  @IsString()
  numeroSerie?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  dataInstalacao?: string;

  @IsOptional()
  @IsString()
  garantiaAte?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  ambiente?: string;

  @IsOptional()
  @IsString()
  marcaModelo?: string;

  @IsOptional()
  @IsString()
  numeroSerie?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  garantiaAte?: string;

  @IsOptional()
  @IsNumber()
  custoAcumulado?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}


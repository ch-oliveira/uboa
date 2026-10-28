import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateBoletimDto {
  @IsNumber()
  @Min(1)
  @Max(12)
  mesCompetencia!: number;

  @IsNumber()
  @Min(2020)
  anoCompetencia!: number;

  @IsString()
  @IsOptional()
  dataInicio?: string;

  @IsString()
  @IsOptional()
  dataFim?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  bdiPercentual?: number;

  @IsString()
  @IsOptional()
  observacoes?: string;
}

export class PreviewBoletimQueryDto {
  @IsOptional()
  mes?: number;

  @IsOptional()
  ano?: number;

  @IsOptional()
  dataInicio?: string;

  @IsOptional()
  dataFim?: string;

  @IsOptional()
  bdiPercentual?: number;
}

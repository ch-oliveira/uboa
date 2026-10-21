import { IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdateContractDto {
  @IsString()
  @IsOptional()
  numeroContrato?: string;

  @IsString()
  @IsOptional()
  numeroEmpenho?: string;

  @IsString()
  @IsOptional()
  empresaContratada?: string;

  @IsString()
  @IsOptional()
  cnpjContratada?: string;

  @IsString()
  @IsOptional()
  objeto?: string;

  @IsString()
  @IsOptional()
  categoriaPadrao?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  valorTotalEmpenhado?: number;

  @IsString()
  @IsOptional()
  vigenciaInicio?: string;

  @IsString()
  @IsOptional()
  vigenciaFim?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}

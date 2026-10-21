import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  numeroContrato!: string;

  @IsString()
  @IsNotEmpty()
  numeroEmpenho!: string;

  @IsString()
  @IsNotEmpty()
  empresaContratada!: string;

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
  valorTotalEmpenhado!: number;

  @IsString()
  @IsOptional()
  vigenciaInicio?: string;

  @IsString()
  @IsOptional()
  vigenciaFim?: string;
}

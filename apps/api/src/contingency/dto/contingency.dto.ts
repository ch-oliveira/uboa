import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAlertDto {
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @IsString()
  @IsOptional()
  nivel?: string; // MODERADO, PERIGO, MUITO_PERIGOSO

  @IsString()
  @IsOptional()
  tipoEvento?: string; // CHUVA_INTENSA, VENDAVAL, ONDA_DE_CALOR, DESCARGAS_ELETRICAS, INUNDACAO

  @IsString()
  @IsOptional()
  fonte?: string; // DEFESA_CIVIL, INMET, CEMADEN, MANUAL

  @IsString()
  @IsOptional()
  inicioPrevisto?: string;

  @IsString()
  @IsOptional()
  fimPrevisto?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  acoesRecomendadas?: string[];
}

export class TriggerContingencyDto {
  @IsString()
  @IsOptional()
  alertaId?: string;

  @IsString()
  @IsOptional()
  tipoEvento?: string;

  @IsString()
  @IsOptional()
  nivel?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  predioIds?: string[];

  @IsBoolean()
  @IsOptional()
  priorizarEscolasSaude?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  checklistPersonalizado?: string[];

  @IsString()
  @IsOptional()
  tecnicoResponsavelId?: string;
}

export class CompleteContingencyChecklistDto {
  @IsArray()
  @IsOptional()
  checklistItens?: Array<{
    item: string;
    checado: boolean;
    observacao?: string;
  }>;

  @IsBoolean()
  @IsOptional()
  riscoMitigado?: boolean;

  @IsString()
  @IsOptional()
  laudoTecnico?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fotosVistoria?: string[];
}

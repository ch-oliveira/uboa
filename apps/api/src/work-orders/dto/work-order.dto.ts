import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateWorkOrderDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  titulo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  facilityName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  predio?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  prioridade?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descricao?: string;

  @IsString()
  @IsOptional()
  technicianName?: string;

  @IsString()
  @IsOptional()
  tecnico?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  codigo?: string;

  @IsString()
  @IsOptional()
  id?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fotos?: string[];

  @IsString()
  @IsOptional()
  ordemVinculadaId?: string;

  @IsString()
  @IsOptional()
  ordem_vinculada_id?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  dataAgendamento?: string;

  @IsString()
  @IsOptional()
  horarioAgendamento?: string;
}

export class UpdateWorkOrderDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  titulo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descricao?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  prioridade?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  technicianName?: string;

  @IsString()
  @IsOptional()
  tecnico?: string;

  @IsString()
  @IsOptional()
  facilityName?: string;

  @IsString()
  @IsOptional()
  predio?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  dataAgendamento?: string;

  @IsString()
  @IsOptional()
  horarioAgendamento?: string;

  @IsString()
  @IsOptional()
  motivoPausa?: string;

  @IsString()
  @IsOptional()
  motivo_pausa?: string;

  @IsString()
  @IsOptional()
  motivoCancelamento?: string;

  @IsString()
  @IsOptional()
  motivo_cancelamento?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fotos?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fotosConclusao?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fotos_conclusao?: string[];
}

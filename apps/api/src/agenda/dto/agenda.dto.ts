import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInspectionDto {
  @IsString()
  @IsNotEmpty({ message: 'O título da vistoria é obrigatório.' })
  title!: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  subtitulo?: string;

  @IsString()
  @IsNotEmpty({ message: 'O horário da vistoria é obrigatório (ex: 09:00, 14:30).' })
  scheduledTime!: string;

  @IsString()
  @IsOptional()
  dataAgendada?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  recorrencia?: string;

  @IsString()
  @IsOptional()
  technicianName?: string;

  @IsString()
  @IsOptional()
  tecnico?: string;

  @IsString()
  @IsOptional()
  technicianId?: string;

  @IsString()
  @IsOptional()
  tecnicoId?: string;

  @IsString()
  @IsOptional()
  facilityId?: string;

  @IsString()
  @IsOptional()
  predioId?: string;

  @IsString()
  @IsOptional()
  workOrderId?: string;

  @IsString()
  @IsOptional()
  ordemServicoId?: string;
}

export class CompleteInspectionDto {
  @IsBoolean()
  @IsOptional()
  concluido?: boolean;

  @IsString()
  @IsOptional()
  laudoTecnico?: string;

  @IsString()
  @IsOptional()
  laudo?: string;

  @IsString()
  @IsOptional()
  parecer?: string;

  @IsArray()
  @IsOptional()
  fotosVistoria?: string[];

  @IsString()
  @IsOptional()
  horario?: string;

  @IsString()
  @IsOptional()
  recorrencia?: string;
}

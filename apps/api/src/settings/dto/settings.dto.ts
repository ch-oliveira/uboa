import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  municipalityName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  prefeituraNome?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  departmentName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  secretariaNome?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  managerName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  gestorNome?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  managerRole?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  gestorCargo?: string;

  @IsString()
  @IsOptional()
  managerEmail?: string;

  @IsString()
  @IsOptional()
  gestorEmail?: string;

  @IsString()
  @IsOptional()
  managerPhone?: string;

  @IsString()
  @IsOptional()
  gestorTelefone?: string;

  @IsNumber()
  @IsOptional()
  slaUrgentHours?: number;

  @IsNumber()
  @IsOptional()
  slaAltaHours?: number;

  @IsNumber()
  @IsOptional()
  slaMediaHours?: number;

  @IsNumber()
  @IsOptional()
  slaBaixaHours?: number;

  @IsNumber()
  @IsOptional()
  mttrAlertHours?: number;

  @IsNumber()
  @IsOptional()
  preventiveGoal?: number;

  @IsBoolean()
  @IsOptional()
  soundAlertsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotificationsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  whatsappAlertsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  autoDispatchEnabled?: boolean;
}

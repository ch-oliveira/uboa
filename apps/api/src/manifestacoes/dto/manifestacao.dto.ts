import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { TipoManifestacao, Prioridade } from '@repo/database';

export class CreateManifestacaoDto {
  @IsString()
  @IsOptional()
  predioId?: string;

  @IsString()
  @IsOptional()
  localReferencia?: string;

  @IsString()
  @IsOptional()
  bairro?: string;

  @IsEnum(TipoManifestacao)
  @IsOptional()
  tipo?: TipoManifestacao = TipoManifestacao.RECLAMACAO;

  @IsString()
  @IsOptional()
  categoria?: string = 'GERAL';

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'A descrição deve conter no mínimo 10 caracteres para que possa ser avaliada.' })
  @MaxLength(3000, { message: 'A descrição não pode exceder 3000 caracteres.' })
  descricao: string;

  @IsBoolean()
  @IsOptional()
  anonimo?: boolean = false;

  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefone?: string;
}

export class ResponderManifestacaoDto {
  @IsString()
  @IsNotEmpty({ message: 'A resposta oficial é obrigatória.' })
  @MinLength(5, { message: 'A resposta oficial deve conter ao menos 5 caracteres.' })
  resposta: string;

  @IsString()
  @IsOptional()
  acao?: 'RESPONDER' | 'ARQUIVAR' | 'ENCAMINHAR' = 'RESPONDER';

  @IsString()
  @IsOptional()
  motivoArquivamento?: string;
}

export class ConverterManifestacaoOsDto {
  @IsString()
  @IsOptional()
  predioId?: string;

  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  categoria?: string = 'GERAL';

  @IsEnum(Prioridade)
  @IsOptional()
  prioridade?: Prioridade = Prioridade.MEDIA;
}

import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ChatDto {
  @IsString({ message: 'A mensagem deve ser um texto válido.' })
  @IsNotEmpty({ message: 'A mensagem não pode ser vazia.' })
  @MaxLength(3000, { message: 'A mensagem excede o limite máximo de 3.000 caracteres.' })
  message!: string;

  @IsArray()
  @IsOptional()
  history?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

export class TriageDto {
  @IsString({ message: 'O título é obrigatório.' })
  @IsNotEmpty({ message: 'O título não pode ser vazio.' })
  @MaxLength(300, { message: 'O título excede o limite de 300 caracteres.' })
  titulo!: string;

  @IsString({ message: 'O prédio municipal é obrigatório.' })
  @IsNotEmpty({ message: 'O prédio municipal não pode ser vazio.' })
  @MaxLength(200, { message: 'O nome do prédio excede o limite de 200 caracteres.' })
  predio!: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  descricao?: string;

  @IsString()
  @IsOptional()
  prioridade?: string;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsString()
  @IsOptional()
  localizacao?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fotos?: string[];
}

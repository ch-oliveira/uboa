export class CreateMaterialDto {
  codigo!: string;
  nome!: string;
  categoria?: string;
  unidadeMedida?: string;
  precoUnitario!: number;
  estoqueAtual?: number;
  estoqueMinimo?: number;
}

-- AlterTable
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "contrato_id" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "contratos_manutencao" (
    "id" TEXT NOT NULL,
    "numero_contrato" TEXT NOT NULL,
    "numero_empenho" TEXT NOT NULL,
    "empresa_contratada" TEXT NOT NULL,
    "cnpj_contratada" TEXT,
    "objeto" TEXT,
    "categoria_padrao" TEXT DEFAULT 'GERAL',
    "valor_total_empenhado" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "vigencia_inicio" TIMESTAMP(3),
    "vigencia_fim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "prefeitura_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_manutencao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "contratos_manutencao_prefeitura_id_ativo_idx" ON "contratos_manutencao"("prefeitura_id", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "contratos_manutencao_prefeitura_id_numero_contrato_key" ON "contratos_manutencao"("prefeitura_id", "numero_contrato");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ordens_servico_contrato_id_fkey'
    ) THEN
        ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos_manutencao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'contratos_manutencao_prefeitura_id_fkey'
    ) THEN
        ALTER TABLE "contratos_manutencao" ADD CONSTRAINT "contratos_manutencao_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

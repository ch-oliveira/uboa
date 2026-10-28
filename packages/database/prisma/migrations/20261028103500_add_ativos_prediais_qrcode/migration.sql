-- AlterTable
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "ativo_id" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ativos_prediais" (
    "id" TEXT NOT NULL,
    "codigo_patrimonio" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'CLIMATIZACAO',
    "ambiente" TEXT NOT NULL,
    "marca_modelo" TEXT,
    "numero_serie" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPERACIONAL',
    "data_instalacao" TIMESTAMP(3),
    "garantia_ate" TIMESTAMP(3),
    "ultima_manutencao" TIMESTAMP(3),
    "custo_acumulado" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "predio_id" TEXT NOT NULL,
    "prefeitura_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ativos_prediais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ativos_prediais_prefeitura_id_predio_id_ativo_idx" ON "ativos_prediais"("prefeitura_id", "predio_id", "ativo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ativos_prediais_predio_id_categoria_idx" ON "ativos_prediais"("predio_id", "categoria");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ativos_prediais_prefeitura_id_codigo_patrimonio_key" ON "ativos_prediais"("prefeitura_id", "codigo_patrimonio");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ordens_servico_ativo_id_fkey'
    ) THEN
        ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_ativo_id_fkey" FOREIGN KEY ("ativo_id") REFERENCES "ativos_prediais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ativos_prediais_predio_id_fkey'
    ) THEN
        ALTER TABLE "ativos_prediais" ADD CONSTRAINT "ativos_prediais_predio_id_fkey" FOREIGN KEY ("predio_id") REFERENCES "predios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ativos_prediais_prefeitura_id_fkey'
    ) THEN
        ALTER TABLE "ativos_prediais" ADD CONSTRAINT "ativos_prediais_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;


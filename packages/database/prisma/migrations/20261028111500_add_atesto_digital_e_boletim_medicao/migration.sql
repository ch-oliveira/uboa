-- AlterTable
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "status_atesto" TEXT DEFAULT 'NAO_APLICAVEL';
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "atestado_em" TIMESTAMP(3);
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "atestado_por_id" TEXT;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "parecer_atesto" TEXT;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "assinatura_digital_hash" TEXT;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "avaliacao_atesto" INTEGER;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "boletim_medicao_id" TEXT;

-- AlterTable
ALTER TABLE "contratos_manutencao" ADD COLUMN IF NOT EXISTS "bdi_padrao" DECIMAL(5,2) DEFAULT 20.00;

-- CreateTable
CREATE TABLE IF NOT EXISTS "boletins_medicao" (
    "id" TEXT NOT NULL,
    "numero_boletim" TEXT NOT NULL,
    "mes_competencia" INTEGER NOT NULL,
    "ano_competencia" INTEGER NOT NULL,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "bdi_percentual" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "valor_materiais" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "valor_mao_de_obra" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "valor_direto" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "valor_bdi" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "valor_total" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "observacoes" TEXT,
    "hash_integridade" TEXT,
    "fiscal_responsavel_id" TEXT,
    "contrato_id" TEXT NOT NULL,
    "prefeitura_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boletins_medicao_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "ordens_servico_prefeitura_id_status_atesto_idx" ON "ordens_servico"("prefeitura_id", "status_atesto");
CREATE INDEX IF NOT EXISTS "ordens_servico_boletim_medicao_id_idx" ON "ordens_servico"("boletim_medicao_id");
CREATE UNIQUE INDEX IF NOT EXISTS "boletins_medicao_prefeitura_id_numero_boletim_key" ON "boletins_medicao"("prefeitura_id", "numero_boletim");
CREATE INDEX IF NOT EXISTS "boletins_medicao_prefeitura_id_contrato_id_status_idx" ON "boletins_medicao"("prefeitura_id", "contrato_id", "status");
CREATE INDEX IF NOT EXISTS "boletins_medicao_mes_competencia_ano_competencia_idx" ON "boletins_medicao"("mes_competencia", "ano_competencia");

-- AddForeignKeys
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ordens_servico_atestado_por_id_fkey') THEN
        ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_atestado_por_id_fkey" FOREIGN KEY ("atestado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ordens_servico_boletim_medicao_id_fkey') THEN
        ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_boletim_medicao_id_fkey" FOREIGN KEY ("boletim_medicao_id") REFERENCES "boletins_medicao"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boletins_medicao_fiscal_responsavel_id_fkey') THEN
        ALTER TABLE "boletins_medicao" ADD CONSTRAINT "boletins_medicao_fiscal_responsavel_id_fkey" FOREIGN KEY ("fiscal_responsavel_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boletins_medicao_contrato_id_fkey') THEN
        ALTER TABLE "boletins_medicao" ADD CONSTRAINT "boletins_medicao_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos_manutencao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'boletins_medicao_prefeitura_id_fkey') THEN
        ALTER TABLE "boletins_medicao" ADD CONSTRAINT "boletins_medicao_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

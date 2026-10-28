-- AlterTable
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "categoria_vistoria" TEXT NOT NULL DEFAULT 'ROTINA';
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "alerta_defesa_civil_id" TEXT;
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "checklist_itens" JSONB DEFAULT '[]';
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "risco_mitigado" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "alertas_defesa_civil" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "nivel" TEXT NOT NULL DEFAULT 'PERIGO',
    "tipo_evento" TEXT NOT NULL DEFAULT 'CHUVA_INTENSA',
    "fonte" TEXT NOT NULL DEFAULT 'DEFESA_CIVIL',
    "inicio_previsto" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "fim_previsto" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "acoes_recomendadas" JSONB DEFAULT '[]',
    "prefeitura_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertas_defesa_civil_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "agenda_vistorias_prefeitura_id_categoria_vistoria_idx" ON "agenda_vistorias"("prefeitura_id", "categoria_vistoria");
CREATE INDEX IF NOT EXISTS "agenda_vistorias_alerta_defesa_civil_id_idx" ON "agenda_vistorias"("alerta_defesa_civil_id");
CREATE INDEX IF NOT EXISTS "alertas_defesa_civil_prefeitura_id_ativo_idx" ON "alertas_defesa_civil"("prefeitura_id", "ativo");
CREATE INDEX IF NOT EXISTS "alertas_defesa_civil_prefeitura_id_nivel_idx" ON "alertas_defesa_civil"("prefeitura_id", "nivel");

-- AddForeignKeys
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agenda_vistorias_alerta_defesa_civil_id_fkey') THEN
        ALTER TABLE "agenda_vistorias" ADD CONSTRAINT "agenda_vistorias_alerta_defesa_civil_id_fkey" FOREIGN KEY ("alerta_defesa_civil_id") REFERENCES "alertas_defesa_civil"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'alertas_defesa_civil_prefeitura_id_fkey') THEN
        ALTER TABLE "alertas_defesa_civil" ADD CONSTRAINT "alertas_defesa_civil_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

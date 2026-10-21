-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "ModuloSistema" AS ENUM ('ZELADORIA_PREDIAL', 'OUVIDORIA_CIDADA', 'AGENDA_PREVENTIVA', 'GESTAO_MATERIAIS', 'COPILOT_IA', 'PORTAL_TRANSPARENCIA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable agenda_vistorias
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "atualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "data_agendada" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "fotos_vistoria" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "laudo_tecnico" TEXT;
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "ordem_servico_id" TEXT;
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "predio_id" TEXT;
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "prefeitura_id" TEXT;
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "recorrencia" TEXT DEFAULT 'UNICA';
ALTER TABLE "agenda_vistorias" ADD COLUMN IF NOT EXISTS "tecnico_id" TEXT;

-- AlterTable auditoria_logs
ALTER TABLE "auditoria_logs" ADD COLUMN IF NOT EXISTS "prefeitura_id" TEXT;

-- AlterTable configuracoes_sistema
ALTER TABLE "configuracoes_sistema" ADD COLUMN IF NOT EXISTS "prefeitura_id" TEXT;

-- AlterTable manifestacoes
ALTER TABLE "manifestacoes" ADD COLUMN IF NOT EXISTS "prefeitura_id" TEXT;
ALTER TABLE "manifestacoes" ALTER COLUMN "protocolo" SET DEFAULT concat('OUV-', floor(random() * 900000 + 100000)::text);

-- AlterTable ordens_servico
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "categoria" TEXT DEFAULT 'GERAL';
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "concluido_em" TIMESTAMP(3);
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "data_limite_sla" TIMESTAMP(3);
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "fotos_conclusao" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "historico_pausas" JSONB DEFAULT '[]';
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "iniciado_em" TIMESTAMP(3);
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "motivo_cancelamento" TEXT;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "motivo_pausa" TEXT;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "motivo_violacao_sla" TEXT;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "ordem_vinculada_id" TEXT;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "pausado_em" TIMESTAMP(3);
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "prefeitura_id" TEXT;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "sla_violado" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "tempo_pausa_minutos" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ordens_servico" ALTER COLUMN "codigo" SET DEFAULT concat('OS-', floor(random() * 900000 + 100000)::text);

-- AlterTable predios
ALTER TABLE "predios" ADD COLUMN IF NOT EXISTS "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "predios" ADD COLUMN IF NOT EXISTS "capacidade" INTEGER;
ALTER TABLE "predios" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "predios" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "predios" ADD COLUMN IF NOT EXISTS "motivo_desativacao" TEXT;
ALTER TABLE "predios" ADD COLUMN IF NOT EXISTS "porte" TEXT DEFAULT 'MEDIO';
ALTER TABLE "predios" ADD COLUMN IF NOT EXISTS "prefeitura_id" TEXT;
ALTER TABLE "predios" ADD COLUMN IF NOT EXISTS "setor" TEXT DEFAULT 'ADMINISTRACAO';

-- AlterTable usuarios
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "ativo" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "especialidade" TEXT DEFAULT 'GERAL';
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "prefeitura_id" TEXT;

-- CreateTable prefeituras
CREATE TABLE IF NOT EXISTS "prefeituras" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "brasao_url" TEXT,
    "modulos_ativos" "ModuloSistema"[] DEFAULT ARRAY['ZELADORIA_PREDIAL', 'OUVIDORIA_CIDADA', 'AGENDA_PREVENTIVA', 'COPILOT_IA']::"ModuloSistema"[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prefeituras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "prefeituras_slug_key" ON "prefeituras"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "prefeituras_cnpj_key" ON "prefeituras"("cnpj");

CREATE INDEX IF NOT EXISTS "agenda_vistorias_prefeitura_id_concluido_idx" ON "agenda_vistorias"("prefeitura_id", "concluido");
CREATE INDEX IF NOT EXISTS "auditoria_logs_prefeitura_id_criado_em_idx" ON "auditoria_logs"("prefeitura_id", "criado_em");
CREATE UNIQUE INDEX IF NOT EXISTS "configuracoes_sistema_prefeitura_id_key" ON "configuracoes_sistema"("prefeitura_id");
CREATE INDEX IF NOT EXISTS "manifestacoes_prefeitura_id_status_idx" ON "manifestacoes"("prefeitura_id", "status");
CREATE INDEX IF NOT EXISTS "manifestacoes_prefeitura_id_protocolo_idx" ON "manifestacoes"("prefeitura_id", "protocolo");
CREATE INDEX IF NOT EXISTS "ordens_servico_prefeitura_id_status_idx" ON "ordens_servico"("prefeitura_id", "status");
CREATE INDEX IF NOT EXISTS "ordens_servico_prefeitura_id_prioridade_idx" ON "ordens_servico"("prefeitura_id", "prioridade");
CREATE INDEX IF NOT EXISTS "ordens_servico_prefeitura_id_predio_id_criado_em_idx" ON "ordens_servico"("prefeitura_id", "predio_id", "criado_em");
CREATE INDEX IF NOT EXISTS "predios_prefeitura_id_ativo_idx" ON "predios"("prefeitura_id", "ativo");
CREATE INDEX IF NOT EXISTS "predios_prefeitura_id_tipo_idx" ON "predios"("prefeitura_id", "tipo");
CREATE INDEX IF NOT EXISTS "usuarios_prefeitura_id_role_idx" ON "usuarios"("prefeitura_id", "role");
CREATE INDEX IF NOT EXISTS "usuarios_prefeitura_id_email_idx" ON "usuarios"("prefeitura_id", "email");

-- AddForeignKeys safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_prefeitura_id_fkey') THEN
        ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'predios_prefeitura_id_fkey') THEN
        ALTER TABLE "predios" ADD CONSTRAINT "predios_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ordens_servico_prefeitura_id_fkey') THEN
        ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ordens_servico_ordem_vinculada_id_fkey') THEN
        ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_ordem_vinculada_id_fkey" FOREIGN KEY ("ordem_vinculada_id") REFERENCES "ordens_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auditoria_logs_prefeitura_id_fkey') THEN
        ALTER TABLE "auditoria_logs" ADD CONSTRAINT "auditoria_logs_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agenda_vistorias_predio_id_fkey') THEN
        ALTER TABLE "agenda_vistorias" ADD CONSTRAINT "agenda_vistorias_predio_id_fkey" FOREIGN KEY ("predio_id") REFERENCES "predios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agenda_vistorias_ordem_servico_id_fkey') THEN
        ALTER TABLE "agenda_vistorias" ADD CONSTRAINT "agenda_vistorias_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordens_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agenda_vistorias_prefeitura_id_fkey') THEN
        ALTER TABLE "agenda_vistorias" ADD CONSTRAINT "agenda_vistorias_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'configuracoes_sistema_prefeitura_id_fkey') THEN
        ALTER TABLE "configuracoes_sistema" ADD CONSTRAINT "configuracoes_sistema_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'manifestacoes_prefeitura_id_fkey') THEN
        ALTER TABLE "manifestacoes" ADD CONSTRAINT "manifestacoes_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

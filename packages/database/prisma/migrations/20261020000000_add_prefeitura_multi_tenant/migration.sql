-- CreateEnum
CREATE TYPE "ModuloSistema" AS ENUM ('ZELADORIA_PREDIAL', 'OUVIDORIA_CIDADA', 'AGENDA_PREVENTIVA', 'GESTAO_MATERIAIS', 'COPILOT_IA', 'PORTAL_TRANSPARENCIA');

-- AlterTable
ALTER TABLE "agenda_vistorias" ADD COLUMN     "atualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data_agendada" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fotos_vistoria" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "laudo_tecnico" TEXT,
ADD COLUMN     "ordem_servico_id" TEXT,
ADD COLUMN     "predio_id" TEXT,
ADD COLUMN     "prefeitura_id" TEXT,
ADD COLUMN     "recorrencia" TEXT DEFAULT 'UNICA',
ADD COLUMN     "tecnico_id" TEXT;

-- AlterTable
ALTER TABLE "auditoria_logs" ADD COLUMN     "prefeitura_id" TEXT;

-- AlterTable
ALTER TABLE "configuracoes_sistema" ADD COLUMN     "prefeitura_id" TEXT;

-- AlterTable
ALTER TABLE "manifestacoes" ADD COLUMN     "prefeitura_id" TEXT,
ALTER COLUMN "protocolo" SET DEFAULT concat('OUV-', floor(random() * 900000 + 100000)::text);

-- AlterTable
ALTER TABLE "ordens_servico" ADD COLUMN     "categoria" TEXT DEFAULT 'GERAL',
ADD COLUMN     "concluido_em" TIMESTAMP(3),
ADD COLUMN     "data_limite_sla" TIMESTAMP(3),
ADD COLUMN     "fotos_conclusao" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "historico_pausas" JSONB DEFAULT '[]',
ADD COLUMN     "iniciado_em" TIMESTAMP(3),
ADD COLUMN     "motivo_cancelamento" TEXT,
ADD COLUMN     "motivo_pausa" TEXT,
ADD COLUMN     "motivo_violacao_sla" TEXT,
ADD COLUMN     "ordem_vinculada_id" TEXT,
ADD COLUMN     "pausado_em" TIMESTAMP(3),
ADD COLUMN     "prefeitura_id" TEXT,
ADD COLUMN     "sla_violado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tempo_pausa_minutos" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "codigo" SET DEFAULT concat('OS-', floor(random() * 900000 + 100000)::text);

-- AlterTable
ALTER TABLE "predios" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "capacidade" INTEGER,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "motivo_desativacao" TEXT,
ADD COLUMN     "porte" TEXT DEFAULT 'MEDIO',
ADD COLUMN     "prefeitura_id" TEXT,
ADD COLUMN     "setor" TEXT DEFAULT 'ADMINISTRACAO';

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "especialidade" TEXT DEFAULT 'GERAL',
ADD COLUMN     "prefeitura_id" TEXT;

-- CreateTable
CREATE TABLE "prefeituras" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "brasao_url" TEXT,
    "modulos_ativos" "ModuloSistema"[] DEFAULT ARRAY['ZELADORIA_PREDIAL', 'OUVIDORIA_CIDADA', 'AGENDA_PREVENTIVA', 'COPILOT_IA']::"ModuloSistema"[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB DEFAULT '{}',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prefeituras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prefeituras_slug_key" ON "prefeituras"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "prefeituras_cnpj_key" ON "prefeituras"("cnpj");

-- CreateIndex
CREATE INDEX "agenda_vistorias_prefeitura_id_concluido_idx" ON "agenda_vistorias"("prefeitura_id", "concluido");

-- CreateIndex
CREATE INDEX "auditoria_logs_prefeitura_id_criado_em_idx" ON "auditoria_logs"("prefeitura_id", "criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "configuracoes_sistema_prefeitura_id_key" ON "configuracoes_sistema"("prefeitura_id");

-- CreateIndex
CREATE INDEX "manifestacoes_prefeitura_id_status_idx" ON "manifestacoes"("prefeitura_id", "status");

-- CreateIndex
CREATE INDEX "manifestacoes_prefeitura_id_protocolo_idx" ON "manifestacoes"("prefeitura_id", "protocolo");

-- CreateIndex
CREATE INDEX "ordens_servico_prefeitura_id_status_idx" ON "ordens_servico"("prefeitura_id", "status");

-- CreateIndex
CREATE INDEX "ordens_servico_prefeitura_id_prioridade_idx" ON "ordens_servico"("prefeitura_id", "prioridade");

-- CreateIndex
CREATE INDEX "ordens_servico_prefeitura_id_predio_id_criado_em_idx" ON "ordens_servico"("prefeitura_id", "predio_id", "criado_em");

-- CreateIndex
CREATE INDEX "predios_prefeitura_id_ativo_idx" ON "predios"("prefeitura_id", "ativo");

-- CreateIndex
CREATE INDEX "predios_prefeitura_id_tipo_idx" ON "predios"("prefeitura_id", "tipo");

-- CreateIndex
CREATE INDEX "usuarios_prefeitura_id_role_idx" ON "usuarios"("prefeitura_id", "role");

-- CreateIndex
CREATE INDEX "usuarios_prefeitura_id_email_idx" ON "usuarios"("prefeitura_id", "email");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predios" ADD CONSTRAINT "predios_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_ordem_vinculada_id_fkey" FOREIGN KEY ("ordem_vinculada_id") REFERENCES "ordens_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_logs" ADD CONSTRAINT "auditoria_logs_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_vistorias" ADD CONSTRAINT "agenda_vistorias_predio_id_fkey" FOREIGN KEY ("predio_id") REFERENCES "predios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_vistorias" ADD CONSTRAINT "agenda_vistorias_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordens_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_vistorias" ADD CONSTRAINT "agenda_vistorias_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracoes_sistema" ADD CONSTRAINT "configuracoes_sistema_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifestacoes" ADD CONSTRAINT "manifestacoes_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

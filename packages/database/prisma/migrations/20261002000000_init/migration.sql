-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GESTOR', 'TECNICO', 'SOLICITANTE');

-- CreateEnum
CREATE TYPE "TipoPredio" AS ENUM ('ESCOLA', 'HOSPITAL', 'PRACA', 'ADMINISTRATIVO', 'UBS');

-- CreateEnum
CREATE TYPE "Prioridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "StatusOS" AS ENUM ('RECEBIDO', 'EM_TRIAGEM', 'AGENDADO', 'AGUARDANDO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SOLICITANTE',
    "telefone" TEXT,
    "token_version" INTEGER NOT NULL DEFAULT 1,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoPredio" NOT NULL,
    "endereco" TEXT NOT NULL,
    "gestor_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL,
    "coordenadas" geometry(Point, 4326),

    CONSTRAINT "predios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordens_servico" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL DEFAULT concat('OS-', floor(random() * 900000 + 100000)::text),
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "prioridade" "Prioridade" NOT NULL DEFAULT 'MEDIA',
    "status" "StatusOS" NOT NULL DEFAULT 'RECEBIDO',
    "predio_id" TEXT NOT NULL,
    "solicitante_id" TEXT NOT NULL,
    "tecnico_atribuido_id" TEXT,
    "fotos" TEXT[],
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordens_servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_logs" (
    "id" TEXT NOT NULL,
    "entidade_afetada" TEXT NOT NULL,
    "entidade_id" TEXT NOT NULL,
    "acao" "AuditAction" NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "dados_antigos" JSONB,
    "dados_novos" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_vistorias" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'geral',
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "tecnico" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agenda_vistorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes_sistema" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "prefeitura_nome" TEXT NOT NULL DEFAULT 'Prefeitura Municipal de Gestão Urbana',
    "secretaria_nome" TEXT NOT NULL DEFAULT 'Secretaria de Infraestrutura e Zeladoria Predial',
    "gestor_nome" TEXT NOT NULL DEFAULT 'Mariana Alves',
    "gestor_cargo" TEXT NOT NULL DEFAULT 'Gestora Municipal de Zeladoria',
    "gestor_email" TEXT NOT NULL DEFAULT 'mariana.alves@gestaourbana.gov.br',
    "gestor_telefone" TEXT NOT NULL DEFAULT '(11) 3241-8900',
    "sla_urgente_h" INTEGER NOT NULL DEFAULT 4,
    "sla_alta_h" INTEGER NOT NULL DEFAULT 24,
    "sla_media_h" INTEGER NOT NULL DEFAULT 72,
    "sla_baixa_h" INTEGER NOT NULL DEFAULT 168,
    "mttr_alert_h" INTEGER NOT NULL DEFAULT 8,
    "preventiva_goal" INTEGER NOT NULL DEFAULT 90,
    "sound_alerts" BOOLEAN NOT NULL DEFAULT true,
    "push_notif" BOOLEAN NOT NULL DEFAULT true,
    "whatsapp_alerts" BOOLEAN NOT NULL DEFAULT false,
    "auto_dispatch" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_servico_codigo_key" ON "ordens_servico"("codigo");

-- AddForeignKey
ALTER TABLE "predios" ADD CONSTRAINT "predios_gestor_id_fkey" FOREIGN KEY ("gestor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_predio_id_fkey" FOREIGN KEY ("predio_id") REFERENCES "predios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_solicitante_id_fkey" FOREIGN KEY ("solicitante_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_tecnico_atribuido_id_fkey" FOREIGN KEY ("tecnico_atribuido_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_logs" ADD CONSTRAINT "auditoria_logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

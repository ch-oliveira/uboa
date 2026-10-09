-- CreateEnum
CREATE TYPE "TipoManifestacao" AS ENUM ('RECLAMACAO', 'ELOGIO', 'SUGESTAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusManifestacao" AS ENUM ('RECEBIDA', 'EM_ANALISE', 'RESPONDIDA', 'ENCAMINHADA', 'ARQUIVADA', 'CONVERTIDA_EM_OS');

-- CreateTable
CREATE TABLE "manifestacoes" (
    "id" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL DEFAULT concat('OUV-', floor(random() * 900000 + 100000)::text),
    "tipo" "TipoManifestacao" NOT NULL DEFAULT 'RECLAMACAO',
    "categoria" TEXT NOT NULL DEFAULT 'GERAL',
    "descricao" TEXT NOT NULL,
    "predio_id" TEXT,
    "local_referencia" TEXT,
    "bairro" TEXT,
    "anonimo" BOOLEAN NOT NULL DEFAULT false,
    "manifestante_nome" TEXT,
    "manifestante_email" TEXT,
    "manifestante_telefone" TEXT,
    "status" "StatusManifestacao" NOT NULL DEFAULT 'RECEBIDA',
    "resposta_oficial" TEXT,
    "respondido_em" TIMESTAMP(3),
    "respondido_por_id" TEXT,
    "motivo_arquivamento" TEXT,
    "ordem_servico_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manifestacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "manifestacoes_protocolo_key" ON "manifestacoes"("protocolo");

-- CreateIndex
CREATE INDEX "manifestacoes_predio_id_status_idx" ON "manifestacoes"("predio_id", "status");

-- CreateIndex
CREATE INDEX "manifestacoes_status_criado_em_idx" ON "manifestacoes"("status", "criado_em");

-- AddForeignKey
ALTER TABLE "manifestacoes" ADD CONSTRAINT "manifestacoes_predio_id_fkey" FOREIGN KEY ("predio_id") REFERENCES "predios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifestacoes" ADD CONSTRAINT "manifestacoes_respondido_por_id_fkey" FOREIGN KEY ("respondido_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manifestacoes" ADD CONSTRAINT "manifestacoes_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordens_servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

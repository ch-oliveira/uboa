-- AlterTable manifestacoes
ALTER TABLE "manifestacoes" ALTER COLUMN "protocolo" SET DEFAULT concat('OUV-', floor(random() * 900000 + 100000)::text);

-- AlterTable ordens_servico
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "custo_mao_de_obra" DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "custo_materiais" DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "custo_total" DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "empresa_terceirizada" TEXT;
ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "numero_empenho" TEXT;
ALTER TABLE "ordens_servico" ALTER COLUMN "codigo" SET DEFAULT concat('OS-', floor(random() * 900000 + 100000)::text);

-- CreateTable materiais
CREATE TABLE IF NOT EXISTS "materiais" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'GERAL',
    "unidade_medida" TEXT NOT NULL DEFAULT 'UN',
    "preco_unitario" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "estoque_atual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estoque_minimo" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "prefeitura_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable itens_consumo_os
CREATE TABLE IF NOT EXISTS "itens_consumo_os" (
    "id" TEXT NOT NULL,
    "ordem_servico_id" TEXT NOT NULL,
    "material_id" TEXT,
    "descricao" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unidade_medida" TEXT NOT NULL DEFAULT 'UN',
    "preco_unitario" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "preco_total" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_consumo_os_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "materiais_prefeitura_id_categoria_idx" ON "materiais"("prefeitura_id", "categoria");
CREATE UNIQUE INDEX IF NOT EXISTS "materiais_prefeitura_id_codigo_key" ON "materiais"("prefeitura_id", "codigo");
CREATE INDEX IF NOT EXISTS "itens_consumo_os_ordem_servico_id_idx" ON "itens_consumo_os"("ordem_servico_id");
CREATE INDEX IF NOT EXISTS "itens_consumo_os_material_id_idx" ON "itens_consumo_os"("material_id");

-- AddForeignKeys safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'materiais_prefeitura_id_fkey') THEN
        ALTER TABLE "materiais" ADD CONSTRAINT "materiais_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'itens_consumo_os_ordem_servico_id_fkey') THEN
        ALTER TABLE "itens_consumo_os" ADD CONSTRAINT "itens_consumo_os_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordens_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'itens_consumo_os_material_id_fkey') THEN
        ALTER TABLE "itens_consumo_os" ADD CONSTRAINT "itens_consumo_os_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

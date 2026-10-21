-- AlterTable
ALTER TABLE "manifestacoes" ALTER COLUMN "protocolo" SET DEFAULT concat('OUV-', floor(random() * 900000 + 100000)::text);

-- AlterTable
ALTER TABLE "ordens_servico" ADD COLUMN     "custo_mao_de_obra" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "custo_materiais" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "custo_total" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "empresa_terceirizada" TEXT,
ADD COLUMN     "numero_empenho" TEXT,
ALTER COLUMN "codigo" SET DEFAULT concat('OS-', floor(random() * 900000 + 100000)::text);

-- CreateTable
CREATE TABLE "materiais" (
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
    "atualizado" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_consumo_os" (
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
CREATE INDEX "materiais_prefeitura_id_categoria_idx" ON "materiais"("prefeitura_id", "categoria");

-- CreateIndex
CREATE UNIQUE INDEX "materiais_prefeitura_id_codigo_key" ON "materiais"("prefeitura_id", "codigo");

-- CreateIndex
CREATE INDEX "itens_consumo_os_ordem_servico_id_idx" ON "itens_consumo_os"("ordem_servico_id");

-- CreateIndex
CREATE INDEX "itens_consumo_os_material_id_idx" ON "itens_consumo_os"("material_id");

-- AddForeignKey
ALTER TABLE "materiais" ADD CONSTRAINT "materiais_prefeitura_id_fkey" FOREIGN KEY ("prefeitura_id") REFERENCES "prefeituras"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_consumo_os" ADD CONSTRAINT "itens_consumo_os_ordem_servico_id_fkey" FOREIGN KEY ("ordem_servico_id") REFERENCES "ordens_servico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_consumo_os" ADD CONSTRAINT "itens_consumo_os_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

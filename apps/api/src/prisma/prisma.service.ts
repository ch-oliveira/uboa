import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@repo/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    await this.ensureDefaultTenantAndBackfill();
  }

  /**
   * Garante a existência do Tenant Padrão (Cliente Piloto) e vincula
   * automaticamente qualquer registro legado órfão (prefeitura_id == null).
   */
  public async ensureDefaultTenantAndBackfill() {
    try {
      // 0. Garantir colunas e tabelas de evolução de schema de forma idempotente
      if (typeof this.$executeRawUnsafe === 'function') {
        await this.$executeRawUnsafe(
          `ALTER TABLE "ordens_servico" ADD COLUMN IF NOT EXISTS "ativo_id" TEXT;`,
        ).catch(() => null);
        await this.$executeRawUnsafe(`
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
            "atualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "ativos_prediais_pkey" PRIMARY KEY ("id")
          );
        `).catch(() => null);
      }

      // 1. Criar ou obter a prefeitura padrão
      const defaultTenant = await this.prefeitura.upsert({
        where: { slug: 'default' },
        update: {},
        create: {
          id: 'prefeitura-default',
          slug: 'default',
          nome: 'Prefeitura Municipal de Gestão Urbana',
          cnpj: '46.123.456/0001-78',
          ativo: true,
          modulos_ativos: [
            'ZELADORIA_PREDIAL',
            'OUVIDORIA_CIDADA',
            'AGENDA_PREVENTIVA',
            'COPILOT_IA',
          ],
        },
      });

      // 2. Backfill em usuários que ainda não tenham prefeitura vinculada
      const unassignedUsers = await this.usuario.updateMany({
        where: { prefeitura_id: null },
        data: { prefeitura_id: defaultTenant.id },
      });

      if (unassignedUsers.count > 0) {
        this.logger.log(`Multi-Tenant Backfill: ${unassignedUsers.count} usuários foram vinculados à prefeitura ${defaultTenant.nome}.`);
      }

      // 3. Backfill em prédios e ordens de serviço órfãs
      await this.predio.updateMany({
        where: { prefeitura_id: null },
        data: { prefeitura_id: defaultTenant.id },
      });

      await this.ordemServico.updateMany({
        where: { prefeitura_id: null },
        data: { prefeitura_id: defaultTenant.id },
      });

      await this.agendaVistoria.updateMany({
        where: { prefeitura_id: null },
        data: { prefeitura_id: defaultTenant.id },
      });

      await this.manifestacao.updateMany({
        where: { prefeitura_id: null },
        data: { prefeitura_id: defaultTenant.id },
      });
    } catch (err: any) {
      this.logger.warn(`Tenant backfill warning: ${err?.message || err}`);
    }
  }
}

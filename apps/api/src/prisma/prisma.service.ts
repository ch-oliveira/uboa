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

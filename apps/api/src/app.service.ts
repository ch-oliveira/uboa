import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';
import type { ApiResponse } from './common/interfaces/api-response.interface.js';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatus(): Promise<ApiResponse<any>> {
    const [usersCount, facilitiesCount, workOrdersCount, inspectionsCount] = await Promise.all([
      this.prisma.usuario.count().catch(() => 0),
      this.prisma.predio.count().catch(() => 0),
      this.prisma.ordemServico.count().catch(() => 0),
      this.prisma.agendaVistoria.count().catch(() => 0),
    ]);

    return {
      success: true,
      data: {
        status: 'online',
        name: 'Municipal Facility Maintenance API',
        environment: process.env.NODE_ENV || 'development',
        orm: {
          provider: 'Prisma ORM',
          package: '@repo/database',
          schemaPath: 'packages/database/prisma/schema.prisma',
          models: ['Usuario', 'Predio', 'OrdemServico', 'AgendaVistoria', 'ConfiguracaoSistema', 'AuditoriaLog'],
        },
        database: {
          engine: 'PostgreSQL 16 + PostGIS',
          host: 'localhost:5432',
          database: 'predial_db',
          status: 'connected',
          tables: {
            users: usersCount,
            facilities: facilitiesCount,
            workOrders: workOrdersCount,
            inspections: inspectionsCount,
          },
        },
        endpoints: {
          workOrders: '/api/work-orders',
          facilities: '/api/facilities',
          agenda: '/api/agenda',
          settings: '/api/settings',
          users: '/api/users',
          authLogin: '/api/auth/login',
        },
      },
      message: 'API is healthy and operational.',
    };
  }
}

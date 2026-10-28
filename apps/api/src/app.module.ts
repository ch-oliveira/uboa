import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { FacilitiesModule } from './facilities/facilities.module.js';
import { WorkOrdersModule } from './work-orders/work-orders.module.js';
import { AgendaModule } from './agenda/agenda.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { AiModule } from './ai/ai.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { ManifestacoesModule } from './manifestacoes/manifestacoes.module.js';
import { MaterialsModule } from './materials/materials.module.js';
import { ContractsModule } from './contracts/contracts.module.js';
import { AssetsModule } from './assets/assets.module.js';
import { ContingencyModule } from './contingency/contingency.module.js';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { RolesGuard } from './auth/roles.guard.js';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    FacilitiesModule, 
    WorkOrdersModule,
    AgendaModule,
    SettingsModule,
    AiModule,
    ReportsModule,
    ManifestacoesModule,
    MaterialsModule,
    ContractsModule,
    AssetsModule,
    ContingencyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

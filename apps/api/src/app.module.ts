import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { FacilitiesModule } from './facilities/facilities.module.js';
import { WorkOrdersModule } from './work-orders/work-orders.module.js';
import { AgendaModule } from './agenda/agenda.module.js';
import { SettingsModule } from './settings/settings.module.js';

@Module({
  imports: [
    PrismaModule, 
    AuthModule, 
    UsersModule, 
    FacilitiesModule, 
    WorkOrdersModule,
    AgendaModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

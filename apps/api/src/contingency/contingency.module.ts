import { Module } from '@nestjs/common';
import { ContingencyController } from './contingency.controller.js';
import { ContingencyService } from './contingency.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ContingencyController],
  providers: [ContingencyService],
  exports: [ContingencyService],
})
export class ContingencyModule {}

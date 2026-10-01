import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AiController } from './ai.controller.js';
import { AiService } from './ai.service.js';
import { AiToolsService } from './ai-tools.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, AiToolsService],
  exports: [AiService, AiToolsService],
})
export class AiModule {}

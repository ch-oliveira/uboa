import { Module } from '@nestjs/common';
import { ManifestacoesController } from './manifestacoes.controller.js';
import { ManifestacoesService } from './manifestacoes.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [ManifestacoesController],
  providers: [ManifestacoesService],
  exports: [ManifestacoesService],
})
export class ManifestacoesModule {}

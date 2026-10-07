import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { AgendaService } from './agenda.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Role } from '@repo/database';
import { CreateInspectionDto, CompleteInspectionDto } from './dto/agenda.dto.js';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  async findAll(@CurrentUser() user?: any) {
    return this.agendaService.findAll(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.agendaService.findOne(id, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Post()
  async create(@Body() body: CreateInspectionDto, @CurrentUser() user?: any) {
    return this.agendaService.create(body, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  @Put(':id/concluir')
  async complete(
    @Param('id') id: string,
    @Body() body: CompleteInspectionDto,
    @CurrentUser() user?: any,
  ) {
    return this.agendaService.complete(id, { ...body, concluido: true }, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: CompleteInspectionDto,
    @CurrentUser() user?: any,
  ) {
    if (body.concluido !== undefined || body.laudoTecnico || body.laudo || body.parecer) {
      return this.agendaService.complete(id, body, user);
    }
    return this.agendaService.toggle(id, user);
  }
}

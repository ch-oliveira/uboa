import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { AgendaService } from './agenda.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@repo/database';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  async findAll() {
    return this.agendaService.findAll();
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Post()
  async create(@Body() body: any) {
    return this.agendaService.create(body);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  @Put(':id')
  async toggle(@Param('id') id: string) {
    return this.agendaService.toggle(id);
  }
}

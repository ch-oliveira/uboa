import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { AgendaService } from './agenda.service.js';

@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  async findAll() {
    return this.agendaService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    return this.agendaService.create(body);
  }

  @Put(':id')
  async toggle(@Param('id') id: string) {
    return this.agendaService.toggle(id);
  }
}

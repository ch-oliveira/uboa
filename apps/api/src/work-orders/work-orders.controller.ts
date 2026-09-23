import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service.js';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  async findAll(
    @Query('role') role?: string,
    @Query('predio') predio?: string,
    @Query('tecnico') tecnico?: string,
    @Query('status') status?: string,
    @Query('prioridade') prioridade?: string
  ) {
    return this.workOrdersService.findAll({ role, predio, tecnico, status, prioridade });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.workOrdersService.create(body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.workOrdersService.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.workOrdersService.remove(id);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service.js';
import { Public } from '../auth/public.decorator.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@repo/database';
import { CreateWorkOrderDto, UpdateWorkOrderDto } from './dto/work-order.dto.js';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Get()
  async findAll(
    @Query('role') role?: string,
    @Query('predio') predio?: string,
    @Query('tecnico') tecnico?: string,
    @Query('status') status?: string,
    @Query('prioridade') prioridade?: string,
    @CurrentUser() user?: any,
  ) {
    return this.workOrdersService.findAll({ role, predio, tecnico, status, prioridade }, user);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Public()
  @Post()
  async create(@Body() body: CreateWorkOrderDto, @CurrentUser() user?: any) {
    return this.workOrdersService.create(body, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR, Role.TECNICO)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: UpdateWorkOrderDto, @CurrentUser() user?: any) {
    return this.workOrdersService.update(id, body, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Body() body?: { motivoCancelamento?: string; motivo?: string },
    @CurrentUser() user?: any,
  ) {
    return this.workOrdersService.remove(id, body?.motivoCancelamento || body?.motivo, user);
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { FacilitiesService } from './facilities.service.js';
import { Public } from '../auth/public.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@repo/database';
import { CreateFacilityDto, UpdateFacilityDto } from './dto/facility.dto.js';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Public()
  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('setor') setor?: string,
    @Query('tipo') tipo?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.facilitiesService.findAll({ status, setor, tipo, ativo });
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.facilitiesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Post()
  async create(@Body() body: CreateFacilityDto, @CurrentUser() user?: any) {
    return this.facilitiesService.create(body, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateFacilityDto,
    @CurrentUser() user?: any,
  ) {
    return this.facilitiesService.update(id, body, user);
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.facilitiesService.remove(id, user);
  }
}

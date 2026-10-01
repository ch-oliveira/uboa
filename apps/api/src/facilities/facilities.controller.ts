import { Controller, Get, Post, Body } from '@nestjs/common';
import { FacilitiesService } from './facilities.service.js';
import { Public } from '../auth/public.decorator.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@repo/database';
import { CreateFacilityDto } from './dto/facility.dto.js';

import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Public()
  @Get()
  async findAll() {
    return this.facilitiesService.findAll();
  }

  @Roles(Role.ADMIN, Role.GESTOR)
  @Post()
  async create(@Body() body: CreateFacilityDto, @CurrentUser() user?: any) {
    return this.facilitiesService.create(body, user);
  }
}

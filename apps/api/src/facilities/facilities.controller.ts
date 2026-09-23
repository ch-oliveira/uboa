import { Controller, Get, Post, Body } from '@nestjs/common';
import { FacilitiesService } from './facilities.service.js';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  async findAll() {
    return this.facilitiesService.findAll();
  }

  @Post()
  async create(@Body() body: any) {
    return this.facilitiesService.create(body);
  }
}

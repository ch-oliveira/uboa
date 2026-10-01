import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@repo/database';

@Roles(Role.ADMIN, Role.GESTOR)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}

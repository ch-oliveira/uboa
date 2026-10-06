import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@repo/database';
import { CreateUserDto } from './dto/create-user.dto.js';

@Roles(Role.ADMIN, Role.GESTOR)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query('role') role?: string) {
    return this.usersService.findAll(role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}

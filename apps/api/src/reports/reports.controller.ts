import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { ReportsFilterDto } from './dto/reports.dto.js';
import { Roles } from '../auth/roles.decorator.js';
import { Role } from '@repo/database';
import { CurrentUser } from '../auth/current-user.decorator.js';

@Controller('reports')
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  async getSummary(
    @Query() filter: ReportsFilterDto,
    @CurrentUser() currentUser?: any,
  ) {
    return this.reportsService.getSummary(filter, currentUser);
  }

  @Get('export/audit-csv')
  async exportAuditCsv(
    @Query() filter: ReportsFilterDto,
    @CurrentUser() currentUser?: any,
  ) {
    return this.reportsService.exportAuditCsv(filter, currentUser);
  }

  @Get('audit-logs')
  async getAuditLogs(@CurrentUser() currentUser?: any) {
    return this.reportsService.getAuditLogs(currentUser);
  }
}

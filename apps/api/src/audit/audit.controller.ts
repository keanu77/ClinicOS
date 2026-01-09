import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '@clinic-os/shared';

@Controller('audit')
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  findAll(
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('targetType') targetType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.findAll({
      action,
      userId,
      targetType,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  @Get('actions')
  getActionTypes() {
    return this.auditService.getActionTypes();
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { QueryShiftDto } from './dto/query-shift.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../shared';

@Controller('scheduling')
@UseGuards(RolesGuard)
export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  @Get('shifts')
  findAll(@Query() query: QueryShiftDto) {
    return this.schedulingService.findAll(query);
  }

  @Get('shifts/today')
  getTodayShifts() {
    return this.schedulingService.getTodayShifts();
  }

  @Get('shifts/weekly')
  getWeeklySchedule(@Query('start') start?: string) {
    const startDate = start ? new Date(start) : new Date();
    return this.schedulingService.getWeeklySchedule(startDate);
  }

  @Get('shifts/my')
  getUserShifts(
    @CurrentUser('id') userId: string,
    @Query('month') month?: string,
  ) {
    return this.schedulingService.getUserShifts(userId, month);
  }

  @Get('shifts/:id')
  findById(@Param('id') id: string) {
    return this.schedulingService.findById(id);
  }

  @Post('shifts')
  @Roles(Role.SUPERVISOR)
  create(@Body() dto: CreateShiftDto) {
    return this.schedulingService.create(dto);
  }

  @Patch('shifts/:id')
  @Roles(Role.SUPERVISOR)
  update(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.schedulingService.update(id, dto);
  }

  @Delete('shifts/:id')
  @Roles(Role.SUPERVISOR)
  remove(@Param('id') id: string) {
    return this.schedulingService.delete(id);
  }
}

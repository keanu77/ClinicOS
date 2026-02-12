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
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { SchedulingService } from "./scheduling.service";
import { CreateShiftDto } from "./dto/create-shift.dto";
import { UpdateShiftDto } from "./dto/update-shift.dto";
import { QueryShiftDto } from "./dto/query-shift.dto";
import { QueryMonthlyDto } from "./dto/query-monthly.dto";
import { BulkUpsertScheduleDto } from "./dto/bulk-upsert-schedule.dto";
import { QueryMonthlyStatsDto } from "./dto/query-monthly-stats.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../shared";

@Controller("scheduling")
@UseGuards(RolesGuard)
export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  // ============================================
  // 舊版 Shift 端點（保留向後相容）
  // ============================================

  @Get("shifts")
  @Roles(Role.SUPERVISOR)
  findAll(@Query() query: QueryShiftDto) {
    return this.schedulingService.findAll(query);
  }

  @Get("shifts/today")
  @Roles(Role.STAFF)
  getTodayShifts() {
    return this.schedulingService.getTodayShifts();
  }

  @Get("shifts/weekly")
  @Roles(Role.SUPERVISOR)
  getWeeklySchedule(@Query("start") start?: string) {
    const startDate = start ? new Date(start) : new Date();
    return this.schedulingService.getWeeklySchedule(startDate);
  }

  @Get("shifts/my")
  getUserShifts(
    @CurrentUser("id") userId: string,
    @Query("month") month?: string,
  ) {
    return this.schedulingService.getUserShifts(userId, month);
  }

  @Get("shifts/:id")
  findById(@Param("id") id: string) {
    return this.schedulingService.findById(id);
  }

  @Post("shifts")
  @Roles(Role.SUPERVISOR)
  create(@Body() dto: CreateShiftDto) {
    return this.schedulingService.create(dto);
  }

  @Patch("shifts/:id")
  @Roles(Role.SUPERVISOR)
  update(@Param("id") id: string, @Body() dto: UpdateShiftDto) {
    return this.schedulingService.update(id, dto);
  }

  @Delete("shifts/:id")
  @Roles(Role.SUPERVISOR)
  remove(@Param("id") id: string) {
    return this.schedulingService.delete(id);
  }

  // ============================================
  // 月排班 (ScheduleEntry) 端點
  // ============================================

  @Get("monthly")
  @Roles(Role.STAFF)
  getMonthlySchedule(@Query() query: QueryMonthlyDto) {
    return this.schedulingService.getMonthlySchedule(query);
  }

  @Post("monthly/bulk")
  @Roles(Role.SUPERVISOR)
  bulkUpsertSchedule(@Body() dto: BulkUpsertScheduleDto) {
    return this.schedulingService.bulkUpsertSchedule(dto);
  }

  @Delete("monthly/entry/:id")
  @Roles(Role.SUPERVISOR)
  deleteScheduleEntry(@Param("id") id: string) {
    return this.schedulingService.deleteScheduleEntry(id);
  }

  @Get("monthly/stats")
  @Roles(Role.STAFF)
  getMonthlyStats(@Query() query: QueryMonthlyStatsDto) {
    return this.schedulingService.getMonthlyStats(query);
  }

  @Get("departments/staff")
  @Roles(Role.STAFF)
  getDepartmentStaff(@Query("department") department?: string) {
    return this.schedulingService.getDepartmentStaff(department);
  }

  @Post("import")
  @Roles(Role.SUPERVISOR)
  @UseInterceptors(FileInterceptor("file"))
  async importExcel(
    @UploadedFile() file: any,
    @Query("department") department: string,
  ) {
    if (!file) {
      throw new BadRequestException("請上傳 Excel 檔案");
    }
    return this.schedulingService.importFromExcel(file.buffer, department);
  }

  @Get("export.xlsx")
  @Roles(Role.SUPERVISOR)
  async exportExcel(
    @Query("year") year: string,
    @Query("month") month: string,
    @Query("department") department: string | undefined,
    @Res() res: Response,
  ) {
    const buffer = await this.schedulingService.exportToExcel(
      parseInt(year, 10),
      parseInt(month, 10),
      department,
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=schedule_${year}_${month}.xlsx`,
    );
    res.send(buffer);
  }
}

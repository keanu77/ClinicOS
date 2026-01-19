import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AssetService } from "./asset.service";
import {
  CreateAssetDto,
  UpdateAssetDto,
  QueryAssetDto,
} from "./dto/asset.dto";
import {
  CreateMaintenanceScheduleDto,
  UpdateMaintenanceScheduleDto,
  CreateMaintenanceRecordDto,
} from "./dto/maintenance.dto";
import {
  CreateFaultReportDto,
  ResolveFaultDto,
  QueryFaultDto,
} from "./dto/fault.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../shared";

@Controller("assets")
@UseGuards(RolesGuard)
export class AssetController {
  constructor(private assetService: AssetService) {}

  // ==================== Assets ====================

  @Get()
  findAll(@Query() query: QueryAssetDto) {
    return this.assetService.findAll(query);
  }

  @Get("warranty-expiring")
  @Roles(Role.SUPERVISOR)
  getWarrantyExpiring(@Query("days") days?: string) {
    return this.assetService.getWarrantyExpiring(days ? parseInt(days, 10) : 30);
  }

  @Get("stats")
  @Roles(Role.SUPERVISOR)
  getAssetStats() {
    return this.assetService.getAssetStats();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.assetService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateAssetDto, @CurrentUser("id") userId: string) {
    return this.assetService.create(dto, userId);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  update(
    @Param("id") id: string,
    @Body() dto: UpdateAssetDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.assetService.update(id, dto, userId);
  }

  // ==================== Maintenance Schedules ====================

  @Get("maintenance/upcoming")
  @Roles(Role.SUPERVISOR)
  getUpcomingMaintenance(@Query("days") days?: string) {
    return this.assetService.getUpcomingMaintenance(days ? parseInt(days, 10) : 7);
  }

  @Post("maintenance/schedules")
  @Roles(Role.SUPERVISOR)
  createMaintenanceSchedule(@Body() dto: CreateMaintenanceScheduleDto) {
    return this.assetService.createMaintenanceSchedule(dto);
  }

  @Patch("maintenance/schedules/:id")
  @Roles(Role.SUPERVISOR)
  updateMaintenanceSchedule(
    @Param("id") id: string,
    @Body() dto: UpdateMaintenanceScheduleDto,
  ) {
    return this.assetService.updateMaintenanceSchedule(id, dto);
  }

  @Post("maintenance/records")
  createMaintenanceRecord(
    @Body() dto: CreateMaintenanceRecordDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.assetService.createMaintenanceRecord(dto, userId);
  }

  // ==================== Fault Reports ====================

  @Get("faults")
  getFaults(@Query() query: QueryFaultDto) {
    return this.assetService.getFaults(query);
  }

  @Post("faults")
  createFaultReport(
    @Body() dto: CreateFaultReportDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.assetService.createFaultReport(dto, userId);
  }

  @Post("faults/:id/resolve")
  @Roles(Role.SUPERVISOR)
  resolveFault(
    @Param("id") id: string,
    @Body() dto: ResolveFaultDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.assetService.resolveFault(id, dto, userId);
  }
}

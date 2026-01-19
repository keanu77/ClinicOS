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
} from "@nestjs/common";
import { FinanceService } from "./finance.service";
import {
  CreateCostCategoryDto,
  UpdateCostCategoryDto,
  CreateCostEntryDto,
  UpdateCostEntryDto,
  QueryCostEntryDto,
  CreateRevenueEntryDto,
  UpdateRevenueEntryDto,
  QueryRevenueEntryDto,
  ReportQueryDto,
  SnapshotQueryDto,
} from "./dto/finance.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../shared";

@Controller("finance")
@UseGuards(RolesGuard)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  // ==================== Cost Categories ====================

  @Get("categories")
  @Roles(Role.SUPERVISOR)
  getCostCategories() {
    return this.financeService.getCostCategories();
  }

  @Post("categories")
  @Roles(Role.ADMIN)
  createCostCategory(
    @Body() dto: CreateCostCategoryDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.financeService.createCostCategory(dto, userId);
  }

  @Patch("categories/:id")
  @Roles(Role.ADMIN)
  updateCostCategory(
    @Param("id") id: string,
    @Body() dto: UpdateCostCategoryDto,
  ) {
    return this.financeService.updateCostCategory(id, dto);
  }

  // ==================== Cost Entries ====================

  @Get("costs")
  @Roles(Role.SUPERVISOR)
  getCostEntries(@Query() query: QueryCostEntryDto) {
    return this.financeService.getCostEntries(query);
  }

  @Post("costs")
  @Roles(Role.ADMIN)
  createCostEntry(
    @Body() dto: CreateCostEntryDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.financeService.createCostEntry(dto, userId);
  }

  @Patch("costs/:id")
  @Roles(Role.ADMIN)
  updateCostEntry(@Param("id") id: string, @Body() dto: UpdateCostEntryDto) {
    return this.financeService.updateCostEntry(id, dto);
  }

  @Delete("costs/:id")
  @Roles(Role.ADMIN)
  deleteCostEntry(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.financeService.deleteCostEntry(id, userId);
  }

  // ==================== Revenue Entries ====================

  @Get("revenues")
  @Roles(Role.SUPERVISOR)
  getRevenueEntries(@Query() query: QueryRevenueEntryDto) {
    return this.financeService.getRevenueEntries(query);
  }

  @Post("revenues")
  @Roles(Role.ADMIN)
  createRevenueEntry(
    @Body() dto: CreateRevenueEntryDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.financeService.createRevenueEntry(dto, userId);
  }

  @Patch("revenues/:id")
  @Roles(Role.ADMIN)
  updateRevenueEntry(
    @Param("id") id: string,
    @Body() dto: UpdateRevenueEntryDto,
  ) {
    return this.financeService.updateRevenueEntry(id, dto);
  }

  @Delete("revenues/:id")
  @Roles(Role.ADMIN)
  deleteRevenueEntry(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.financeService.deleteRevenueEntry(id, userId);
  }

  // ==================== Reports ====================

  @Get("reports/summary")
  @Roles(Role.SUPERVISOR)
  getSummary(@Query() query: ReportQueryDto) {
    return this.financeService.getSummary(query);
  }

  @Get("reports/breakdown")
  @Roles(Role.SUPERVISOR)
  getBreakdown(@Query() query: ReportQueryDto) {
    return this.financeService.getBreakdown(query);
  }

  @Get("reports/by-doctor")
  @Roles(Role.SUPERVISOR)
  getByDoctor(@Query() query: ReportQueryDto) {
    return this.financeService.getByDoctor(query);
  }

  @Get("reports/margin")
  @Roles(Role.SUPERVISOR)
  getMarginAnalysis(@Query() query: ReportQueryDto) {
    return this.financeService.getMarginAnalysis(query);
  }

  // ==================== Snapshots ====================

  @Get("snapshots")
  @Roles(Role.SUPERVISOR)
  getSnapshots(@Query() query: SnapshotQueryDto) {
    return this.financeService.getSnapshots(query);
  }

  @Post("snapshots")
  @Roles(Role.ADMIN)
  createMonthlySnapshot(
    @Body() body: { year: number; month: number },
    @CurrentUser("id") userId: string,
  ) {
    return this.financeService.createMonthlySnapshot(
      body.year,
      body.month,
      userId,
    );
  }
}

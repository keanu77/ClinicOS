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
import { QualityService } from "./quality.service";
import {
  CreateIncidentTypeDto,
  CreateIncidentDto,
  UpdateIncidentDto,
  QueryIncidentDto,
  CreateFollowUpDto,
  CreateComplaintDto,
  UpdateComplaintDto,
  QueryComplaintDto,
} from "./dto/quality.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../shared";

@Controller("quality")
@UseGuards(RolesGuard)
export class QualityController {
  constructor(private qualityService: QualityService) {}

  // ==================== Incident Types ====================

  @Get("incident-types")
  getIncidentTypes() {
    return this.qualityService.getIncidentTypes();
  }

  @Post("incident-types")
  @Roles(Role.ADMIN)
  createIncidentType(
    @Body() dto: CreateIncidentTypeDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.qualityService.createIncidentType(dto, userId);
  }

  // ==================== Incidents ====================

  @Get("incidents")
  getIncidents(@Query() query: QueryIncidentDto) {
    return this.qualityService.getIncidents(query);
  }

  @Get("incidents/:id")
  getIncident(@Param("id") id: string) {
    return this.qualityService.getIncident(id);
  }

  @Post("incidents")
  createIncident(
    @Body() dto: CreateIncidentDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.qualityService.createIncident(dto, userId);
  }

  @Patch("incidents/:id")
  @Roles(Role.SUPERVISOR)
  updateIncident(
    @Param("id") id: string,
    @Body() dto: UpdateIncidentDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.qualityService.updateIncident(id, dto, user);
  }

  @Post("incidents/:id/follow-up")
  addFollowUp(
    @Param("id") id: string,
    @Body() dto: CreateFollowUpDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.qualityService.addFollowUp(id, dto, userId);
  }

  @Post("incidents/:id/create-task")
  @Roles(Role.SUPERVISOR)
  createTaskFromIncident(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.qualityService.createTaskFromIncident(id, userId);
  }

  // ==================== Complaints ====================

  @Get("complaints")
  getComplaints(@Query() query: QueryComplaintDto) {
    return this.qualityService.getComplaints(query);
  }

  @Post("complaints")
  createComplaint(
    @Body() dto: CreateComplaintDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.qualityService.createComplaint(dto, userId);
  }

  @Patch("complaints/:id")
  @Roles(Role.SUPERVISOR)
  updateComplaint(@Param("id") id: string, @Body() dto: UpdateComplaintDto) {
    return this.qualityService.updateComplaint(id, dto);
  }

  // ==================== Stats & Reports ====================

  @Get("stats")
  @Roles(Role.SUPERVISOR)
  getQualityStats() {
    return this.qualityService.getQualityStats();
  }

  @Get("reports/trends")
  @Roles(Role.SUPERVISOR)
  getIncidentTrends(@Query("months") months?: string) {
    return this.qualityService.getIncidentTrends(
      months ? parseInt(months, 10) : 6,
    );
  }
}

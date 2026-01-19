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
import { HRService } from "./hr.service";
import {
  CreateEmployeeProfileDto,
  UpdateEmployeeProfileDto,
} from "./dto/create-employee-profile.dto";
import {
  CreateCertificationDto,
  UpdateCertificationDto,
} from "./dto/certification.dto";
import {
  CreateSkillDefinitionDto,
  AssignSkillDto,
  UpdateEmployeeSkillDto,
} from "./dto/skill.dto";
import { CreateLeaveDto, ApproveLeaveDto, QueryLeaveDto } from "./dto/leave.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../shared";

@Controller("hr")
@UseGuards(RolesGuard)
export class HRController {
  constructor(private hrService: HRService) {}

  // ==================== Employees ====================

  @Get("employees")
  @Roles(Role.SUPERVISOR)
  getEmployees(@CurrentUser() user: { id: string; role: string }) {
    return this.hrService.getEmployees(user);
  }

  @Get("employees/:id")
  getEmployee(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.hrService.getEmployee(id, user);
  }

  @Post("employees/:id/profile")
  @Roles(Role.ADMIN)
  createEmployeeProfile(
    @Param("id") id: string,
    @Body() dto: Omit<CreateEmployeeProfileDto, "userId">,
    @CurrentUser("id") adminId: string,
  ) {
    return this.hrService.createEmployeeProfile({ ...dto, userId: id }, adminId);
  }

  @Patch("employees/:id/profile")
  @Roles(Role.ADMIN)
  updateEmployeeProfile(
    @Param("id") id: string,
    @Body() dto: UpdateEmployeeProfileDto,
    @CurrentUser("id") adminId: string,
  ) {
    return this.hrService.updateEmployeeProfile(id, dto, adminId);
  }

  @Get("stats")
  @Roles(Role.SUPERVISOR)
  getHRStats() {
    return this.hrService.getHRStats();
  }

  // ==================== Certifications ====================

  @Get("certifications/expiring")
  @Roles(Role.SUPERVISOR)
  getExpiringCertifications(@Query("days") days?: string) {
    return this.hrService.getExpiringCertifications(days ? parseInt(days, 10) : 30);
  }

  @Get("employees/:id/certifications")
  getEmployeeCertifications(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; role: string },
  ) {
    const isSelf = user.id === id;
    const isSupervisorOrAdmin = [Role.SUPERVISOR, Role.ADMIN].includes(user.role as Role);
    if (!isSelf && !isSupervisorOrAdmin) {
      return [];
    }
    return this.hrService.getCertifications(id);
  }

  @Post("certifications")
  @Roles(Role.ADMIN)
  createCertification(
    @Body() dto: CreateCertificationDto,
    @CurrentUser("id") adminId: string,
  ) {
    return this.hrService.createCertification(dto, adminId);
  }

  @Patch("certifications/:id")
  @Roles(Role.ADMIN)
  updateCertification(
    @Param("id") id: string,
    @Body() dto: UpdateCertificationDto,
    @CurrentUser("id") adminId: string,
  ) {
    return this.hrService.updateCertification(id, dto, adminId);
  }

  @Delete("certifications/:id")
  @Roles(Role.ADMIN)
  deleteCertification(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
  ) {
    return this.hrService.deleteCertification(id, adminId);
  }

  // ==================== Skills ====================

  @Get("skills")
  getSkillDefinitions() {
    return this.hrService.getSkillDefinitions();
  }

  @Post("skills")
  @Roles(Role.ADMIN)
  createSkillDefinition(
    @Body() dto: CreateSkillDefinitionDto,
    @CurrentUser("id") adminId: string,
  ) {
    return this.hrService.createSkillDefinition(dto, adminId);
  }

  @Post("skills/assign")
  @Roles(Role.ADMIN)
  assignSkill(@Body() dto: AssignSkillDto, @CurrentUser("id") adminId: string) {
    return this.hrService.assignSkill(dto, adminId);
  }

  @Patch("employees/:userId/skills/:skillId")
  @Roles(Role.ADMIN)
  updateEmployeeSkill(
    @Param("userId") userId: string,
    @Param("skillId") skillId: string,
    @Body() dto: UpdateEmployeeSkillDto,
  ) {
    return this.hrService.updateEmployeeSkill(userId, skillId, dto);
  }

  @Delete("employees/:userId/skills/:skillId")
  @Roles(Role.ADMIN)
  removeEmployeeSkill(
    @Param("userId") userId: string,
    @Param("skillId") skillId: string,
  ) {
    return this.hrService.removeEmployeeSkill(userId, skillId);
  }

  // ==================== Leave Management ====================

  @Get("leaves")
  getLeaves(
    @Query() query: QueryLeaveDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.hrService.getLeaves(query, user);
  }

  @Post("leaves")
  createLeave(@Body() dto: CreateLeaveDto, @CurrentUser("id") userId: string) {
    return this.hrService.createLeave(dto, userId);
  }

  @Post("leaves/:id/approve")
  @Roles(Role.SUPERVISOR)
  approveLeave(
    @Param("id") id: string,
    @Body() dto: ApproveLeaveDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.hrService.approveLeave(id, dto, user);
  }

  @Post("leaves/:id/cancel")
  cancelLeave(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.hrService.cancelLeave(id, userId);
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { AuditService } from "../audit/audit.service";
import {
  Role,
  CertificationStatus,
  LeaveStatus,
  SkillLevel,
  NotificationType,
} from "../shared";
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
import {
  CreateLeaveDto,
  ApproveLeaveDto,
  QueryLeaveDto,
} from "./dto/leave.dto";

@Injectable()
export class HRService {
  private readonly logger = new Logger(HRService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  // ==================== Employee Profile ====================

  async getEmployees(user: { id: string; role: string }) {
    if (user.role === Role.STAFF) {
      throw new ForbiddenException(
        "Only supervisors and admins can view employee list",
      );
    }

    return this.prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        employeeProfile: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async getEmployee(id: string, user: { id: string; role: string }) {
    const isSelf = user.id === id;
    const isSupervisorOrAdmin = [Role.SUPERVISOR, Role.ADMIN].includes(
      user.role as Role,
    );

    if (!isSelf && !isSupervisorOrAdmin) {
      throw new ForbiddenException("You can only view your own profile");
    }

    const employee = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        employeeProfile: true,
        certifications: {
          orderBy: { expiryDate: "asc" },
        },
        employeeSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    return employee;
  }

  async createEmployeeProfile(dto: CreateEmployeeProfileDto, adminId: string) {
    const existing = await this.prisma.employeeProfile.findUnique({
      where: { userId: dto.userId },
    });

    if (existing) {
      throw new BadRequestException("Employee profile already exists");
    }

    const profile = await this.prisma.employeeProfile.create({
      data: {
        userId: dto.userId,
        department: dto.department,
        position: dto.position,
        employeeNo: dto.employeeNo,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
        phone: dto.phone,
        emergencyContact: dto.emergencyContact,
        emergencyPhone: dto.emergencyPhone,
        address: dto.address,
        notes: dto.notes,
      },
    });

    await this.auditService.create({
      action: "EMPLOYEE_PROFILE_CREATE",
      userId: adminId,
      targetId: dto.userId,
      targetType: "USER",
      metadata: { employeeNo: dto.employeeNo },
    });

    return profile;
  }

  async updateEmployeeProfile(
    userId: string,
    dto: UpdateEmployeeProfileDto,
    adminId: string,
  ) {
    const profile = await this.prisma.employeeProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Auto-create if not exists
      return this.prisma.employeeProfile.create({
        data: {
          userId,
          ...dto,
          hireDate: dto.hireDate ? new Date(dto.hireDate) : null,
        },
      });
    }

    const updated = await this.prisma.employeeProfile.update({
      where: { userId },
      data: {
        ...dto,
        hireDate: dto.hireDate
          ? new Date(dto.hireDate)
          : dto.hireDate === null
            ? null
            : undefined,
      },
    });

    await this.auditService.create({
      action: "EMPLOYEE_PROFILE_UPDATE",
      userId: adminId,
      targetId: userId,
      targetType: "USER",
    });

    return updated;
  }

  // ==================== Certifications ====================

  async getCertifications(userId: string) {
    return this.prisma.certification.findMany({
      where: { userId },
      orderBy: { expiryDate: "asc" },
    });
  }

  async getExpiringCertifications(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.certification.findMany({
      where: {
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
        status: { not: CertificationStatus.EXPIRED },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { expiryDate: "asc" },
    });
  }

  async createCertification(dto: CreateCertificationDto, adminId: string) {
    let status = CertificationStatus.VALID;

    if (dto.expiryDate) {
      const expiry = new Date(dto.expiryDate);
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (expiry < now) {
        status = CertificationStatus.EXPIRED;
      } else if (expiry <= thirtyDaysFromNow) {
        status = CertificationStatus.EXPIRING_SOON;
      }
    }

    const cert = await this.prisma.certification.create({
      data: {
        userId: dto.userId,
        name: dto.name,
        issuingOrg: dto.issuingOrg,
        certNo: dto.certNo,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        status,
        notes: dto.notes,
      },
    });

    await this.auditService.create({
      action: "CERTIFICATION_CREATE",
      userId: adminId,
      targetId: cert.id,
      targetType: "CERTIFICATION",
      metadata: { name: dto.name, userId: dto.userId },
    });

    return cert;
  }

  async updateCertification(
    id: string,
    dto: UpdateCertificationDto,
    adminId: string,
  ) {
    const cert = await this.prisma.certification.findUnique({ where: { id } });
    if (!cert) {
      throw new NotFoundException("Certification not found");
    }

    let status = dto.status;
    if (dto.expiryDate && !dto.status) {
      const expiry = new Date(dto.expiryDate);
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      if (expiry < now) {
        status = CertificationStatus.EXPIRED;
      } else if (expiry <= thirtyDaysFromNow) {
        status = CertificationStatus.EXPIRING_SOON;
      } else {
        status = CertificationStatus.VALID;
      }
    }

    return this.prisma.certification.update({
      where: { id },
      data: {
        ...dto,
        status,
        issueDate: dto.issueDate
          ? new Date(dto.issueDate)
          : dto.issueDate === null
            ? null
            : undefined,
        expiryDate: dto.expiryDate
          ? new Date(dto.expiryDate)
          : dto.expiryDate === null
            ? null
            : undefined,
      },
    });
  }

  async deleteCertification(id: string, adminId: string) {
    const cert = await this.prisma.certification.findUnique({ where: { id } });
    if (!cert) {
      throw new NotFoundException("Certification not found");
    }

    await this.prisma.certification.delete({ where: { id } });

    await this.auditService.create({
      action: "CERTIFICATION_DELETE",
      userId: adminId,
      targetId: id,
      targetType: "CERTIFICATION",
      metadata: { name: cert.name },
    });

    return { success: true };
  }

  // ==================== Skills ====================

  async getSkillDefinitions() {
    return this.prisma.skillDefinition.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  async createSkillDefinition(dto: CreateSkillDefinitionDto, adminId: string) {
    const skill = await this.prisma.skillDefinition.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
      },
    });

    await this.auditService.create({
      action: "SKILL_DEFINITION_CREATE",
      userId: adminId,
      targetId: skill.id,
      targetType: "SKILL_DEFINITION",
      metadata: { name: dto.name },
    });

    return skill;
  }

  async assignSkill(dto: AssignSkillDto, adminId: string) {
    const existing = await this.prisma.employeeSkill.findUnique({
      where: {
        userId_skillId: {
          userId: dto.userId,
          skillId: dto.skillId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException("Skill already assigned to this employee");
    }

    const employeeSkill = await this.prisma.employeeSkill.create({
      data: {
        userId: dto.userId,
        skillId: dto.skillId,
        level: dto.level || SkillLevel.BASIC,
        certifiedAt: dto.certifiedAt ? new Date(dto.certifiedAt) : null,
        notes: dto.notes,
      },
      include: {
        skill: true,
      },
    });

    return employeeSkill;
  }

  async updateEmployeeSkill(
    userId: string,
    skillId: string,
    dto: UpdateEmployeeSkillDto,
  ) {
    return this.prisma.employeeSkill.update({
      where: {
        userId_skillId: { userId, skillId },
      },
      data: {
        ...dto,
        certifiedAt: dto.certifiedAt
          ? new Date(dto.certifiedAt)
          : dto.certifiedAt === null
            ? null
            : undefined,
      },
      include: {
        skill: true,
      },
    });
  }

  async removeEmployeeSkill(userId: string, skillId: string) {
    await this.prisma.employeeSkill.delete({
      where: {
        userId_skillId: { userId, skillId },
      },
    });
    return { success: true };
  }

  // ==================== Leave Management ====================

  async getLeaves(query: QueryLeaveDto, user: { id: string; role: string }) {
    const {
      requesterId,
      status,
      leaveType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};

    // Staff can only see their own leaves
    if (user.role === Role.STAFF) {
      where.requesterId = user.id;
    } else if (requesterId) {
      where.requesterId = requesterId;
    }

    if (status) where.status = status;
    if (leaveType) where.leaveType = leaveType;

    if (startDate || endDate) {
      where.OR = [
        {
          startDate: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          },
        },
        {
          endDate: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.leaveRecord.findMany({
        where,
        include: {
          requester: {
            select: { id: true, name: true, email: true, role: true },
          },
          approver: {
            select: { id: true, name: true },
          },
          coverUser: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.leaveRecord.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createLeave(dto: CreateLeaveDto, userId: string) {
    const leave = await this.prisma.leaveRecord.create({
      data: {
        requesterId: userId,
        leaveType: dto.leaveType,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
        coverUserId: dto.coverUserId,
      },
      include: {
        requester: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify supervisors
    const supervisors = await this.prisma.user.findMany({
      where: {
        role: { in: [Role.SUPERVISOR, Role.ADMIN] },
        isActive: true,
      },
      select: { id: true },
    });

    for (const supervisor of supervisors) {
      await this.notificationsService.create({
        userId: supervisor.id,
        type: NotificationType.LEAVE_REQUEST,
        title: "新請假申請",
        message: `${leave.requester.name} 申請了請假`,
        metadata: { leaveId: leave.id },
      });
    }

    return leave;
  }

  async approveLeave(
    id: string,
    dto: ApproveLeaveDto,
    user: { id: string; role: string },
  ) {
    if (![Role.SUPERVISOR, Role.ADMIN].includes(user.role as Role)) {
      throw new ForbiddenException(
        "Only supervisors and admins can approve leaves",
      );
    }

    const leave = await this.prisma.leaveRecord.findUnique({
      where: { id },
      include: { requester: { select: { id: true, name: true } } },
    });

    if (!leave) {
      throw new NotFoundException("Leave record not found");
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException("Leave is not pending approval");
    }

    const updated = await this.prisma.leaveRecord.update({
      where: { id },
      data: {
        status: dto.approved ? LeaveStatus.APPROVED : LeaveStatus.REJECTED,
        approverId: user.id,
        approvedAt: new Date(),
        rejectReason: dto.rejectReason,
      },
    });

    // Notify requester
    await this.notificationsService.create({
      userId: leave.requesterId,
      type: NotificationType.LEAVE_APPROVED,
      title: dto.approved ? "請假已核准" : "請假已駁回",
      message: dto.approved
        ? "您的請假申請已被核准"
        : `您的請假申請已被駁回：${dto.rejectReason || "無說明"}`,
      metadata: { leaveId: id },
    });

    return updated;
  }

  async cancelLeave(id: string, userId: string) {
    const leave = await this.prisma.leaveRecord.findUnique({ where: { id } });

    if (!leave) {
      throw new NotFoundException("Leave record not found");
    }

    if (leave.requesterId !== userId) {
      throw new ForbiddenException(
        "You can only cancel your own leave requests",
      );
    }

    if (leave.status !== LeaveStatus.PENDING) {
      throw new BadRequestException("Only pending leaves can be cancelled");
    }

    return this.prisma.leaveRecord.update({
      where: { id },
      data: { status: LeaveStatus.CANCELLED },
    });
  }

  // ==================== Stats ====================

  async getHRStats() {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalEmployees,
      activeEmployees,
      expiringCertifications,
      pendingLeaves,
      todayLeaves,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.certification.count({
        where: {
          expiryDate: {
            lte: thirtyDaysFromNow,
            gte: now,
          },
          status: { not: CertificationStatus.EXPIRED },
        },
      }),
      this.prisma.leaveRecord.count({
        where: { status: LeaveStatus.PENDING },
      }),
      this.prisma.leaveRecord.count({
        where: {
          status: LeaveStatus.APPROVED,
          startDate: { lte: tomorrow },
          endDate: { gte: today },
        },
      }),
    ]);

    return {
      totalEmployees,
      activeEmployees,
      expiringCertifications,
      pendingLeaves,
      todayLeaves,
    };
  }
}

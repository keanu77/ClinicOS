import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { AuditService } from "../audit/audit.service";
import { HandoverService } from "../handover/handover.service";
import {
  Role,
  IncidentStatus,
  IncidentSeverity,
  ComplaintStatus,
  NotificationType,
  HandoverPriority,
} from "../shared";
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

@Injectable()
export class QualityService {
  private readonly logger = new Logger(QualityService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private handoverService: HandoverService,
  ) {}

  // ==================== Incident Types ====================

  async getIncidentTypes() {
    return this.prisma.incidentType.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  async createIncidentType(dto: CreateIncidentTypeDto, userId: string) {
    return this.prisma.incidentType.create({
      data: {
        name: dto.name,
        category: dto.category,
        description: dto.description,
        severity: dto.severity || IncidentSeverity.MEDIUM,
      },
    });
  }

  // ==================== Incidents ====================

  async getIncidents(query: QueryIncidentDto) {
    const {
      typeId,
      status,
      severity,
      isNearMiss,
      reporterId,
      handlerId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};
    if (typeId) where.typeId = typeId;
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (isNearMiss !== undefined) where.isNearMiss = isNearMiss;
    if (reporterId) where.reporterId = reporterId;
    if (handlerId) where.handlerId = handlerId;
    if (startDate || endDate) {
      where.occurredAt = {};
      if (startDate) where.occurredAt.gte = new Date(startDate);
      if (endDate) where.occurredAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.incident.findMany({
        where,
        include: {
          type: true,
          reporter: {
            select: { id: true, name: true },
          },
          handler: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ severity: "desc" }, { occurredAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.incident.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getIncident(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        type: true,
        reporter: {
          select: { id: true, name: true, email: true },
        },
        handler: {
          select: { id: true, name: true },
        },
        followUps: {
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        relatedTasks: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    if (!incident) {
      throw new NotFoundException("Incident not found");
    }

    return incident;
  }

  async createIncident(dto: CreateIncidentDto, userId: string) {
    const incidentNo = `INC-${Date.now().toString(36).toUpperCase()}`;

    const incidentType = await this.prisma.incidentType.findUnique({
      where: { id: dto.typeId },
    });

    const incident = await this.prisma.incident.create({
      data: {
        incidentNo,
        typeId: dto.typeId,
        title: dto.title,
        description: dto.description,
        occurredAt: new Date(dto.occurredAt),
        location: dto.location,
        severity: dto.severity || incidentType?.severity || IncidentSeverity.MEDIUM,
        isNearMiss: dto.isNearMiss || false,
        reporterId: userId,
      },
      include: {
        type: true,
        reporter: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify supervisors
    const supervisors = await this.prisma.user.findMany({
      where: { role: { in: [Role.SUPERVISOR, Role.ADMIN] }, isActive: true },
      select: { id: true },
    });

    for (const supervisor of supervisors) {
      await this.notificationsService.create({
        userId: supervisor.id,
        type: NotificationType.INCIDENT_REPORTED,
        title: dto.isNearMiss ? "Near-miss 事件通報" : "事件通報",
        message: `${incident.type.name}: ${dto.title}`,
        metadata: { incidentId: incident.id },
      });
    }

    return incident;
  }

  async updateIncident(
    id: string,
    dto: UpdateIncidentDto,
    user: { id: string; role: string },
  ) {
    const incident = await this.getIncident(id);

    if (![Role.SUPERVISOR, Role.ADMIN].includes(user.role as Role)) {
      throw new ForbiddenException("Only supervisors can update incidents");
    }

    const updateData: any = { ...dto };
    if (dto.status === IncidentStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    return this.prisma.incident.update({
      where: { id },
      data: updateData,
    });
  }

  async addFollowUp(id: string, dto: CreateFollowUpDto, userId: string) {
    await this.getIncident(id);

    return this.prisma.incidentFollowUp.create({
      data: {
        incidentId: id,
        authorId: userId,
        content: dto.content,
        actionTaken: dto.actionTaken,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async createTaskFromIncident(id: string, userId: string) {
    const incident = await this.getIncident(id);

    const task = await this.handoverService.create(
      {
        title: `改善措施：${incident.title}`,
        content: `事件編號：${incident.incidentNo}\n\n原因：${incident.rootCause || "待分析"}\n\n矯正措施：${incident.correctiveAction || "待定"}`,
        priority: HandoverPriority.HIGH,
      },
      userId,
    );

    // Link task to incident
    await this.prisma.handover.update({
      where: { id: task.id },
      data: { relatedIncidentId: id },
    });

    // Update incident status
    await this.prisma.incident.update({
      where: { id },
      data: { status: IncidentStatus.ACTION_REQUIRED },
    });

    return task;
  }

  // ==================== Complaints ====================

  async getComplaints(query: QueryComplaintDto) {
    const { source, status, severity, handlerId, page = 1, limit = 20 } = query;

    const where: any = {};
    if (source) where.source = source;
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (handlerId) where.handlerId = handlerId;

    const [data, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where,
        include: {
          handler: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.complaint.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createComplaint(dto: CreateComplaintDto, userId: string) {
    const complaintNo = `CPL-${Date.now().toString(36).toUpperCase()}`;

    const complaint = await this.prisma.complaint.create({
      data: {
        complaintNo,
        title: dto.title,
        description: dto.description,
        source: dto.source,
        severity: dto.severity || IncidentSeverity.MEDIUM,
      },
    });

    // Notify supervisors
    const supervisors = await this.prisma.user.findMany({
      where: { role: { in: [Role.SUPERVISOR, Role.ADMIN] }, isActive: true },
      select: { id: true },
    });

    for (const supervisor of supervisors) {
      await this.notificationsService.create({
        userId: supervisor.id,
        type: NotificationType.COMPLAINT_RECEIVED,
        title: "新投訴收到",
        message: `${dto.title}`,
        metadata: { complaintId: complaint.id },
      });
    }

    return complaint;
  }

  async updateComplaint(id: string, dto: UpdateComplaintDto) {
    const updateData: any = { ...dto };
    if (dto.status === ComplaintStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    return this.prisma.complaint.update({
      where: { id },
      data: updateData,
    });
  }

  // ==================== Stats ====================

  async getQualityStats() {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [openIncidents, nearMissCount, openComplaints, monthlyIncidents, monthlyComplaints] =
      await Promise.all([
        this.prisma.incident.count({
          where: { status: { not: IncidentStatus.CLOSED } },
        }),
        this.prisma.incident.count({
          where: { isNearMiss: true, createdAt: { gte: thisMonth } },
        }),
        this.prisma.complaint.count({
          where: { status: { not: ComplaintStatus.CLOSED } },
        }),
        this.prisma.incident.count({
          where: { createdAt: { gte: thisMonth } },
        }),
        this.prisma.complaint.count({
          where: { createdAt: { gte: thisMonth } },
        }),
      ]);

    return {
      openIncidents,
      nearMissCount,
      openComplaints,
      monthlyIncidents,
      monthlyComplaints,
    };
  }

  async getIncidentTrends(months: number = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const incidents = await this.prisma.incident.groupBy({
      by: ["typeId"],
      where: {
        occurredAt: { gte: startDate },
      },
      _count: true,
    });

    return incidents;
  }
}

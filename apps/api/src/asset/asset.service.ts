import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { AuditService } from "../audit/audit.service";
import {
  AssetStatus,
  FaultStatus,
  FaultSeverity,
  MaintenanceType,
  NotificationType,
} from "../shared";
import { CreateAssetDto, UpdateAssetDto, QueryAssetDto } from "./dto/asset.dto";
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

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  // ==================== Assets ====================

  async findAll(query: QueryAssetDto) {
    const {
      category,
      status,
      location,
      department,
      page = 1,
      limit = 20,
    } = query;

    const where: any = { isActive: true };
    if (category) where.category = category;
    if (status) where.status = status;
    if (location) where.location = location;
    if (department) where.department = department;

    const [data, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        orderBy: [{ category: "asc" }, { name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        maintenanceSchedules: {
          where: { isActive: true },
          orderBy: { nextDueAt: "asc" },
        },
        maintenanceRecords: {
          orderBy: { performedAt: "desc" },
          take: 10,
          include: {
            performedBy: {
              select: { id: true, name: true },
            },
          },
        },
        faultReports: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            reporter: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException("Asset not found");
    }

    return asset;
  }

  async create(dto: CreateAssetDto, userId: string) {
    const existing = await this.prisma.asset.findUnique({
      where: { assetNo: dto.assetNo },
    });

    if (existing) {
      throw new BadRequestException("Asset number already exists");
    }

    const asset = await this.prisma.asset.create({
      data: {
        name: dto.name,
        assetNo: dto.assetNo,
        category: dto.category,
        model: dto.model,
        brand: dto.brand,
        serialNo: dto.serialNo,
        location: dto.location,
        department: dto.department,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
        purchaseCost: dto.purchaseCost,
        warrantyStart: dto.warrantyStart ? new Date(dto.warrantyStart) : null,
        warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd) : null,
        expectedLife: dto.expectedLife,
        condition: dto.condition,
        notes: dto.notes,
      },
    });

    await this.auditService.create({
      action: "ASSET_CREATE",
      userId,
      targetId: asset.id,
      targetType: "ASSET",
      metadata: { assetNo: dto.assetNo, name: dto.name },
    });

    return asset;
  }

  async update(id: string, dto: UpdateAssetDto, userId: string) {
    const asset = await this.findOne(id);

    const updated = await this.prisma.asset.update({
      where: { id },
      data: {
        ...dto,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        warrantyStart: dto.warrantyStart
          ? new Date(dto.warrantyStart)
          : undefined,
        warrantyEnd: dto.warrantyEnd ? new Date(dto.warrantyEnd) : undefined,
      },
    });

    await this.auditService.create({
      action: "ASSET_UPDATE",
      userId,
      targetId: id,
      targetType: "ASSET",
    });

    return updated;
  }

  async getWarrantyExpiring(days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.asset.findMany({
      where: {
        isActive: true,
        warrantyEnd: {
          lte: futureDate,
          gte: new Date(),
        },
        status: { not: AssetStatus.DISPOSED },
      },
      orderBy: { warrantyEnd: "asc" },
    });
  }

  // ==================== Maintenance Schedules ====================

  async createMaintenanceSchedule(dto: CreateMaintenanceScheduleDto) {
    await this.findOne(dto.assetId);

    return this.prisma.maintenanceSchedule.create({
      data: {
        assetId: dto.assetId,
        name: dto.name,
        description: dto.description,
        frequency: dto.frequency,
        frequencyDays: dto.frequencyDays,
        nextDueAt: dto.nextDueAt ? new Date(dto.nextDueAt) : new Date(),
      },
    });
  }

  async updateMaintenanceSchedule(
    id: string,
    dto: UpdateMaintenanceScheduleDto,
  ) {
    return this.prisma.maintenanceSchedule.update({
      where: { id },
      data: dto,
    });
  }

  async getUpcomingMaintenance(days: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.maintenanceSchedule.findMany({
      where: {
        isActive: true,
        nextDueAt: {
          lte: futureDate,
        },
      },
      include: {
        asset: {
          select: { id: true, name: true, assetNo: true, location: true },
        },
      },
      orderBy: { nextDueAt: "asc" },
    });
  }

  // ==================== Maintenance Records ====================

  async createMaintenanceRecord(
    dto: CreateMaintenanceRecordDto,
    userId: string,
  ) {
    await this.findOne(dto.assetId);

    const record = await this.prisma.maintenanceRecord.create({
      data: {
        assetId: dto.assetId,
        scheduleId: dto.scheduleId,
        type: dto.type,
        description: dto.description,
        cost: dto.cost,
        performedAt: dto.performedAt ? new Date(dto.performedAt) : new Date(),
        performedById: userId,
        notes: dto.notes,
      },
    });

    // Update schedule's lastDoneAt and nextDueAt if scheduled
    if (dto.scheduleId) {
      const schedule = await this.prisma.maintenanceSchedule.findUnique({
        where: { id: dto.scheduleId },
      });

      if (schedule) {
        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + schedule.frequencyDays);

        await this.prisma.maintenanceSchedule.update({
          where: { id: dto.scheduleId },
          data: {
            lastDoneAt: new Date(),
            nextDueAt: nextDue,
          },
        });
      }
    }

    return record;
  }

  // ==================== Fault Reports ====================

  async createFaultReport(dto: CreateFaultReportDto, userId: string) {
    const asset = await this.findOne(dto.assetId);

    const fault = await this.prisma.faultReport.create({
      data: {
        assetId: dto.assetId,
        reporterId: userId,
        title: dto.title,
        description: dto.description,
        severity: dto.severity || FaultSeverity.MEDIUM,
      },
      include: {
        asset: {
          select: { id: true, name: true, assetNo: true },
        },
        reporter: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify supervisors - optimized with createMany
    const supervisors = await this.prisma.user.findMany({
      where: { role: { in: ["SUPERVISOR", "ADMIN"] }, isActive: true },
      select: { id: true },
    });

    if (supervisors.length > 0) {
      await this.prisma.notification.createMany({
        data: supervisors.map((supervisor) => ({
          userId: supervisor.id,
          type: NotificationType.ASSET_FAULT_REPORTED,
          title: "設備故障回報",
          message: `${asset.name} (${asset.assetNo}) 回報了故障：${dto.title}`,
          metadata: JSON.stringify({ faultId: fault.id, assetId: dto.assetId }),
        })),
      });
    }

    return fault;
  }

  async getFaults(query: QueryFaultDto) {
    const {
      assetId,
      status,
      severity,
      reporterId,
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};
    if (assetId) where.assetId = assetId;
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (reporterId) where.reporterId = reporterId;

    const [data, total] = await Promise.all([
      this.prisma.faultReport.findMany({
        where,
        include: {
          asset: {
            select: { id: true, name: true, assetNo: true, location: true },
          },
          reporter: {
            select: { id: true, name: true },
          },
          resolver: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.faultReport.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async resolveFault(id: string, dto: ResolveFaultDto, userId: string) {
    const fault = await this.prisma.faultReport.findUnique({
      where: { id },
      include: { reporter: { select: { id: true } } },
    });

    if (!fault) {
      throw new NotFoundException("Fault report not found");
    }

    const updated = await this.prisma.faultReport.update({
      where: { id },
      data: {
        status: FaultStatus.RESOLVED,
        resolverId: userId,
        resolvedAt: new Date(),
        resolution: dto.resolution,
      },
    });

    // Notify reporter
    await this.notificationsService.create({
      userId: fault.reporterId,
      type: NotificationType.ASSET_FAULT_REPORTED,
      title: "故障已解決",
      message: `您回報的故障已被解決`,
      metadata: { faultId: id },
    });

    return updated;
  }

  async getOpenFaults() {
    return this.prisma.faultReport.findMany({
      where: {
        status: {
          in: [
            FaultStatus.REPORTED,
            FaultStatus.INVESTIGATING,
            FaultStatus.IN_REPAIR,
          ],
        },
      },
      include: {
        asset: {
          select: { id: true, name: true, assetNo: true, location: true },
        },
        reporter: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 10,
    });
  }

  // ==================== Stats ====================

  async getAssetStats() {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [
      totalAssets,
      inUseAssets,
      maintenanceAssets,
      expiringWarranty,
      upcomingMaintenance,
      openFaults,
    ] = await Promise.all([
      this.prisma.asset.count({ where: { isActive: true } }),
      this.prisma.asset.count({
        where: { isActive: true, status: AssetStatus.IN_USE },
      }),
      this.prisma.asset.count({
        where: { isActive: true, status: AssetStatus.MAINTENANCE },
      }),
      this.prisma.asset.count({
        where: {
          isActive: true,
          warrantyEnd: { lte: thirtyDaysFromNow, gte: now },
        },
      }),
      this.prisma.maintenanceSchedule.count({
        where: {
          isActive: true,
          nextDueAt: { lte: sevenDaysFromNow },
        },
      }),
      this.prisma.faultReport.count({
        where: {
          status: { notIn: [FaultStatus.RESOLVED, FaultStatus.CLOSED] },
        },
      }),
    ]);

    return {
      totalAssets,
      inUseAssets,
      maintenanceAssets,
      expiringWarranty,
      upcomingMaintenance,
      openFaults,
    };
  }
}

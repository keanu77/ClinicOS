import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogDto {
  action: string;
  userId: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(options: {
    action?: string;
    userId?: string;
    targetType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { action, userId, targetType, startDate, endDate } = options;
    const pageNum = Number(options.page) || 1;
    const limitNum = Number(options.limit) || 50;

    const where: any = {};

    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (targetType) where.targetType = targetType;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async create(dto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        action: dto.action,
        userId: dto.userId,
        targetId: dto.targetId,
        targetType: dto.targetType,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
        ip: dto.ip,
        userAgent: dto.userAgent,
      },
    });
  }

  async getActionTypes() {
    const logs = await this.prisma.auditLog.findMany({
      distinct: ['action'],
      select: { action: true },
    });

    return logs.map((log) => log.action);
  }
}

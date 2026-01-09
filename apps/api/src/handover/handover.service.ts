import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  Role,
  HandoverStatus,
  HandoverPriority,
  NotificationType,
} from '@clinic-os/shared';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { UpdateHandoverDto } from './dto/update-handover.dto';
import { QueryHandoverDto } from './dto/query-handover.dto';

@Injectable()
export class HandoverService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(query: QueryHandoverDto, user: { id: string; role: string }) {
    const { status, priority, assigneeId, createdById, page = 1, limit = 20 } = query;

    const where: any = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;
    if (createdById) where.createdById = createdById;

    const [data, total] = await Promise.all([
      this.prisma.handover.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true, role: true },
          },
          assignee: {
            select: { id: true, name: true, email: true, role: true },
          },
          comments: {
            include: {
              author: {
                select: { id: true, name: true, role: true },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.handover.count({ where }),
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
    const handover = await this.prisma.handover.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignee: {
          select: { id: true, name: true, email: true, role: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, role: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        shift: true,
      },
    });

    if (!handover) {
      throw new NotFoundException('Handover not found');
    }

    return handover;
  }

  async findMyHandovers(userId: string) {
    return this.prisma.handover.findMany({
      where: {
        assigneeId: userId,
        status: {
          in: [HandoverStatus.PENDING, HandoverStatus.IN_PROGRESS],
        },
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });
  }

  async create(dto: CreateHandoverDto, userId: string) {
    const handover = await this.prisma.handover.create({
      data: {
        title: dto.title,
        content: dto.content,
        priority: dto.priority || HandoverPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdById: userId,
        assigneeId: dto.assigneeId || null,
        shiftId: dto.shiftId || null,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        assignee: {
          select: { id: true, name: true },
        },
      },
    });

    // Send notification if assigned
    if (dto.assigneeId) {
      await this.notificationsService.create({
        userId: dto.assigneeId,
        type: NotificationType.HANDOVER_ASSIGNED,
        title: '新交班指派',
        message: `您有一項新的交班事項：${dto.title}`,
        metadata: { handoverId: handover.id },
      });
    }

    return handover;
  }

  async update(
    id: string,
    dto: UpdateHandoverDto,
    user: { id: string; role: string },
  ) {
    const handover = await this.findOne(id);

    // Permission check
    const isOwner = handover.createdById === user.id;
    const isAssignee = handover.assigneeId === user.id;
    const isSupervisorOrAdmin = [Role.SUPERVISOR, Role.ADMIN].includes(
      user.role as Role,
    );

    if (!isOwner && !isAssignee && !isSupervisorOrAdmin) {
      throw new ForbiddenException('You cannot modify this handover');
    }

    // Staff can only update status if assigned
    if (user.role === Role.STAFF && !isOwner && !isAssignee) {
      throw new ForbiddenException('You cannot modify this handover');
    }

    const updateData: any = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.dueDate !== undefined) {
      updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    // Only supervisor+ can change assignee
    if (dto.assigneeId !== undefined && isSupervisorOrAdmin) {
      updateData.assigneeId = dto.assigneeId;

      // Notify new assignee
      if (dto.assigneeId && dto.assigneeId !== handover.assigneeId) {
        await this.notificationsService.create({
          userId: dto.assigneeId,
          type: NotificationType.HANDOVER_ASSIGNED,
          title: '交班指派',
          message: `您被指派了一項交班事項：${handover.title}`,
          metadata: { handoverId: id },
        });
      }
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === HandoverStatus.COMPLETED) {
        updateData.completedAt = new Date();
      }
    }

    return this.prisma.handover.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        assignee: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id); // Check exists
    return this.prisma.handover.delete({ where: { id } });
  }

  async addComment(id: string, content: string, userId: string) {
    const handover = await this.findOne(id);

    const comment = await this.prisma.handoverComment.create({
      data: {
        content,
        handoverId: id,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Notify handover creator and assignee
    const notifyUsers = new Set<string>();
    if (handover.createdById !== userId) notifyUsers.add(handover.createdById);
    if (handover.assigneeId && handover.assigneeId !== userId) {
      notifyUsers.add(handover.assigneeId);
    }

    for (const targetUserId of notifyUsers) {
      await this.notificationsService.create({
        userId: targetUserId,
        type: NotificationType.HANDOVER_COMMENTED,
        title: '交班註記',
        message: `${comment.author.name} 在交班事項中新增了註記`,
        metadata: { handoverId: id, commentId: comment.id },
      });
    }

    return comment;
  }

  async getPendingCount() {
    return this.prisma.handover.count({
      where: {
        status: {
          in: [HandoverStatus.PENDING, HandoverStatus.IN_PROGRESS],
        },
      },
    });
  }

  async getUrgentHandovers() {
    return this.prisma.handover.findMany({
      where: {
        status: {
          in: [HandoverStatus.PENDING, HandoverStatus.IN_PROGRESS],
        },
        priority: {
          in: [HandoverPriority.HIGH, HandoverPriority.URGENT],
        },
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
        assignee: {
          select: { id: true, name: true },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 10,
    });
  }
}

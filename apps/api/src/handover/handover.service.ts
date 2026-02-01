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
import { CacheService } from "../common/cache/cache.service";
import {
  CACHE_KEYS,
  CACHE_TTL,
} from "../common/cache/cache.module";
import {
  Role,
  HandoverStatus,
  HandoverPriority,
  NotificationType,
  TaskCollaboratorRole,
} from "../shared";
import { CreateHandoverDto } from "./dto/create-handover.dto";
import { UpdateHandoverDto } from "./dto/update-handover.dto";
import { QueryHandoverDto } from "./dto/query-handover.dto";
import {
  SetCategoriesDto,
  AddCollaboratorDto,
  CreateChecklistDto,
  UpdateChecklistDto,
  CreateSubTaskDto,
} from "./dto/task-enhanced.dto";

@Injectable()
export class HandoverService {
  private readonly logger = new Logger(HandoverService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private cacheService: CacheService,
  ) {}

  async findAll(query: QueryHandoverDto, user: { id: string; role: string }) {
    const {
      status,
      priority,
      assigneeId,
      createdById,
      page = 1,
      limit = 20,
    } = query;

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
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
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
          orderBy: { createdAt: "asc" },
        },
        shift: true,
        // Enhanced Task Relations
        categories: {
          include: {
            category: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
        checklists: {
          orderBy: { sortOrder: "asc" },
        },
        subTasks: {
          include: {
            assignee: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        parent: {
          select: { id: true, title: true },
        },
      },
    });

    if (!handover) {
      throw new NotFoundException("Handover not found");
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
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    });
  }

  async create(dto: CreateHandoverDto, userId: string) {
    this.logger.log(`Creating handover: "${dto.title}" by user ${userId}`);

    const handover = await this.prisma.handover.create({
      data: {
        title: dto.title,
        content: dto.content,
        priority: dto.priority || HandoverPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdById: userId,
        assigneeId: dto.assigneeId || null,
        shiftId: dto.shiftId || null,
        // Enhanced Task Fields
        estimatedHours: dto.estimatedHours || null,
        parentId: dto.parentId || null,
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

    // Set categories if provided
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      await this.prisma.taskCategoryAssignment.createMany({
        data: dto.categoryIds.map((categoryId) => ({
          handoverId: handover.id,
          categoryId,
        })),
      });
    }

    // Send notification if assigned
    if (dto.assigneeId) {
      await this.notificationsService.create({
        userId: dto.assigneeId,
        type: NotificationType.HANDOVER_ASSIGNED,
        title: "新交班指派",
        message: `您有一項新的交班事項：${dto.title}`,
        metadata: { handoverId: handover.id },
      });
    }

    this.logger.log(`Handover created: ${handover.id}`);

    // 記錄審計日誌
    await this.auditService.create({
      action: "HANDOVER_CREATE",
      userId,
      targetId: handover.id,
      targetType: "HANDOVER",
      metadata: { title: dto.title, priority: dto.priority },
    });

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
      this.logger.warn(
        `Forbidden: user ${user.id} tried to modify handover ${id}`,
      );
      throw new ForbiddenException("You cannot modify this handover");
    }

    // Staff can only update status if assigned
    if (user.role === Role.STAFF && !isOwner && !isAssignee) {
      throw new ForbiddenException("You cannot modify this handover");
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
          title: "交班指派",
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
      if (dto.status === HandoverStatus.BLOCKED && dto.blockedReason) {
        updateData.blockedReason = dto.blockedReason;
      }
    }

    // Enhanced Task Fields
    if (dto.estimatedHours !== undefined) {
      updateData.estimatedHours = dto.estimatedHours;
    }
    if (dto.actualHours !== undefined) {
      updateData.actualHours = dto.actualHours;
    }
    if (dto.blockedReason !== undefined) {
      updateData.blockedReason = dto.blockedReason;
    }
    if (dto.parentId !== undefined) {
      updateData.parentId = dto.parentId;
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

  async delete(id: string, userId: string) {
    const handover = await this.findOne(id);
    this.logger.log(`Deleting handover: ${id}`);

    await this.prisma.handover.delete({ where: { id } });

    // 記錄審計日誌
    await this.auditService.create({
      action: "HANDOVER_DELETE",
      userId,
      targetId: id,
      targetType: "HANDOVER",
      metadata: { title: handover.title },
    });

    return { success: true };
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
        title: "交班註記",
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
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 10,
    });
  }

  // ==================== Task Categories ====================

  async getTaskCategories() {
    return this.cacheService.wrap(
      CACHE_KEYS.TASK_CATEGORIES,
      () =>
        this.prisma.taskCategory.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
        }),
      CACHE_TTL.LONG, // 1 hour cache
    );
  }

  async createTaskCategory(name: string, color?: string, description?: string) {
    return this.prisma.taskCategory.create({
      data: { name, color: color || "#3B82F6", description },
    });
  }

  async setCategories(handoverId: string, dto: SetCategoriesDto) {
    await this.findOne(handoverId);

    // Delete existing assignments
    await this.prisma.taskCategoryAssignment.deleteMany({
      where: { handoverId },
    });

    // Create new assignments
    if (dto.categoryIds.length > 0) {
      await this.prisma.taskCategoryAssignment.createMany({
        data: dto.categoryIds.map((categoryId) => ({
          handoverId,
          categoryId,
        })),
      });
    }

    return this.findOne(handoverId);
  }

  // ==================== Collaborators ====================

  async addCollaborator(
    handoverId: string,
    dto: AddCollaboratorDto,
    user: { id: string; role: string },
  ) {
    const handover = await this.findOne(handoverId);

    // Check permission
    const isSupervisorOrAdmin = [Role.SUPERVISOR, Role.ADMIN].includes(
      user.role as Role,
    );
    if (!isSupervisorOrAdmin && handover.createdById !== user.id) {
      throw new ForbiddenException(
        "Only supervisors or the creator can add collaborators",
      );
    }

    // Check if already a collaborator
    const existing = await this.prisma.taskCollaborator.findUnique({
      where: {
        handoverId_userId: {
          handoverId,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException("User is already a collaborator");
    }

    const collaborator = await this.prisma.taskCollaborator.create({
      data: {
        handoverId,
        userId: dto.userId,
        role: dto.role || TaskCollaboratorRole.COLLABORATOR,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Notify the collaborator
    await this.notificationsService.create({
      userId: dto.userId,
      type: NotificationType.HANDOVER_ASSIGNED,
      title: "任務協作邀請",
      message: `您被加入為任務「${handover.title}」的協作者`,
      metadata: { handoverId },
    });

    return collaborator;
  }

  async removeCollaborator(handoverId: string, userId: string) {
    await this.prisma.taskCollaborator.delete({
      where: {
        handoverId_userId: { handoverId, userId },
      },
    });
    return { success: true };
  }

  // ==================== Checklists ====================

  async addChecklist(handoverId: string, dto: CreateChecklistDto) {
    await this.findOne(handoverId);

    // Get max sort order
    const maxSortOrder = await this.prisma.taskChecklist.aggregate({
      where: { handoverId },
      _max: { sortOrder: true },
    });

    return this.prisma.taskChecklist.create({
      data: {
        handoverId,
        content: dto.content,
        sortOrder: dto.sortOrder ?? (maxSortOrder._max.sortOrder ?? 0) + 1,
      },
    });
  }

  async updateChecklist(
    handoverId: string,
    checklistId: string,
    dto: UpdateChecklistDto,
  ) {
    const checklist = await this.prisma.taskChecklist.findFirst({
      where: { id: checklistId, handoverId },
    });

    if (!checklist) {
      throw new NotFoundException("Checklist item not found");
    }

    const updateData: any = {};
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;
    if (dto.isCompleted !== undefined) {
      updateData.isCompleted = dto.isCompleted;
      updateData.completedAt = dto.isCompleted ? new Date() : null;
    }

    return this.prisma.taskChecklist.update({
      where: { id: checklistId },
      data: updateData,
    });
  }

  async deleteChecklist(handoverId: string, checklistId: string) {
    await this.prisma.taskChecklist.delete({
      where: { id: checklistId },
    });
    return { success: true };
  }

  // ==================== SubTasks ====================

  async createSubTask(parentId: string, dto: CreateSubTaskDto, userId: string) {
    const parent = await this.findOne(parentId);

    const subTask = await this.prisma.handover.create({
      data: {
        title: dto.title,
        content: dto.content,
        priority: dto.priority || HandoverPriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        createdById: userId,
        assigneeId: dto.assigneeId || null,
        parentId,
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

    // Notify assignee if any
    if (dto.assigneeId) {
      await this.notificationsService.create({
        userId: dto.assigneeId,
        type: NotificationType.HANDOVER_ASSIGNED,
        title: "子任務指派",
        message: `您被指派了任務「${parent.title}」的子任務：${dto.title}`,
        metadata: { handoverId: subTask.id, parentId },
      });
    }

    return subTask;
  }

  async getSubTasks(parentId: string) {
    return this.prisma.handover.findMany({
      where: { parentId },
      include: {
        assignee: {
          select: { id: true, name: true },
        },
        _count: {
          select: { checklists: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  // ==================== Task Stats ====================

  async getTaskStats() {
    const [pending, inProgress, blocked, completed, byCategory] =
      await Promise.all([
        this.prisma.handover.count({
          where: { status: HandoverStatus.PENDING },
        }),
        this.prisma.handover.count({
          where: { status: HandoverStatus.IN_PROGRESS },
        }),
        this.prisma.handover.count({
          where: { status: HandoverStatus.BLOCKED },
        }),
        this.prisma.handover.count({
          where: {
            status: HandoverStatus.COMPLETED,
            completedAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        }),
        this.prisma.taskCategoryAssignment.groupBy({
          by: ["categoryId"],
          _count: true,
        }),
      ]);

    return {
      pending,
      inProgress,
      blocked,
      completedThisWeek: completed,
      byCategory,
    };
  }
}

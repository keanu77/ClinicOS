import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { AuditService } from "../audit/audit.service";
import { CacheService } from "../common/cache/cache.service";
import { CACHE_KEYS, CACHE_TTL } from "../common/cache/cache.module";
import {
  DocumentStatus,
  AnnouncementPriority,
  NotificationType,
} from "../shared";
import {
  CreateDocumentCategoryDto,
  CreateDocumentDto,
  UpdateDocumentDto,
  PublishDocumentDto,
  QueryDocumentDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  QueryAnnouncementDto,
} from "./dto/document.dto";

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private cacheService: CacheService,
  ) {}

  // ==================== Document Categories ====================

  async getCategories() {
    return this.cacheService.wrap(
      CACHE_KEYS.DOCUMENT_CATEGORIES,
      () =>
        this.prisma.documentCategory.findMany({
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        }),
      CACHE_TTL.LONG, // 1 hour cache
    );
  }

  async createCategory(dto: CreateDocumentCategoryDto) {
    return this.prisma.documentCategory.create({
      data: {
        name: dto.name,
        description: dto.description,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder || 0,
      },
    });
  }

  // ==================== Documents ====================

  async getDocuments(query: QueryDocumentDto) {
    const { categoryId, status, search, page = 1, limit = 20 } = query;

    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { docNo: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.document.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getDocument(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        category: true,
        createdBy: {
          select: { id: true, name: true },
        },
        versions: {
          orderBy: { version: "desc" },
        },
        readConfirmations: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { readAt: "desc" },
        },
      },
    });

    if (!document) {
      throw new NotFoundException("Document not found");
    }

    return document;
  }

  async createDocument(dto: CreateDocumentDto, userId: string) {
    const existing = await this.prisma.document.findUnique({
      where: { docNo: dto.docNo },
    });

    if (existing) {
      throw new BadRequestException("Document number already exists");
    }

    const document = await this.prisma.document.create({
      data: {
        docNo: dto.docNo,
        title: dto.title,
        content: dto.content,
        categoryId: dto.categoryId,
        createdById: userId,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : null,
        reviewDate: dto.reviewDate ? new Date(dto.reviewDate) : null,
      },
    });

    await this.auditService.create({
      action: "DOCUMENT_CREATE",
      userId,
      targetId: document.id,
      targetType: "DOCUMENT",
      metadata: { docNo: dto.docNo, title: dto.title },
    });

    return document;
  }

  async updateDocument(id: string, dto: UpdateDocumentDto, userId: string) {
    return this.prisma.document.update({
      where: { id },
      data: {
        ...dto,
        effectiveDate: dto.effectiveDate
          ? new Date(dto.effectiveDate)
          : undefined,
        reviewDate: dto.reviewDate ? new Date(dto.reviewDate) : undefined,
      },
    });
  }

  async publishDocument(id: string, dto: PublishDocumentDto, userId: string) {
    const document = await this.getDocument(id);

    // Create a version record
    await this.prisma.documentVersion.create({
      data: {
        documentId: id,
        version: document.version,
        title: document.title,
        content: document.content,
        changeNotes: dto.changeNotes,
        publishedAt: new Date(),
      },
    });

    // Update document
    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        status: DocumentStatus.PUBLISHED,
        version: document.version + 1,
        publishedAt: new Date(),
      },
    });

    // Notify all users about new document - optimized with createMany
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    if (users.length > 0) {
      await this.prisma.notification.createMany({
        data: users.map((user) => ({
          userId: user.id,
          type: NotificationType.DOCUMENT_PUBLISHED,
          title: "新文件發布",
          message: `文件「${document.title}」已發布`,
          metadata: JSON.stringify({ documentId: id }),
        })),
      });
    }

    await this.auditService.create({
      action: "DOCUMENT_PUBLISH",
      userId,
      targetId: id,
      targetType: "DOCUMENT",
      metadata: { version: updated.version },
    });

    return updated;
  }

  async confirmRead(documentId: string, userId: string) {
    const document = await this.getDocument(documentId);

    const existing = await this.prisma.documentReadConfirmation.findUnique({
      where: {
        documentId_userId_version: {
          documentId,
          userId,
          version: document.version,
        },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.documentReadConfirmation.create({
      data: {
        documentId,
        userId,
        version: document.version,
      },
    });
  }

  async getMyUnreadDocuments(userId: string) {
    // Optimized: Use raw SQL with LEFT JOIN + WHERE NULL pattern
    // instead of N+1 loop queries (was 1 + N queries, now just 1 query)
    const unreadDocs = await this.prisma.$queryRaw<
      Array<{ id: string; version: number; title: string; docNo: string }>
    >`
      SELECT d.id, d.version, d.title, d.docNo
      FROM "Document" d
      LEFT JOIN "DocumentReadConfirmation" drc
        ON d.id = drc.documentId
        AND drc.userId = ${userId}
        AND drc.version = d.version
      WHERE d.status = ${DocumentStatus.PUBLISHED}
        AND d."isActive" = true
        AND drc.id IS NULL
    `;

    return unreadDocs;
  }

  // ==================== Announcements ====================

  async getAnnouncements(
    query: QueryAnnouncementDto,
    userId: string,
    userRole: string,
  ) {
    const { priority, isPinned, page = 1, limit = 20 } = query;

    const now = new Date();
    const where: any = {
      isActive: true,
      publishAt: { lte: now },
      OR: [{ expireAt: null }, { expireAt: { gt: now } }],
    };

    if (priority) where.priority = priority;
    if (isPinned !== undefined) where.isPinned = isPinned;

    // Filter by target roles
    where.AND = [
      {
        OR: [{ targetRoles: null }, { targetRoles: { contains: userRole } }],
      },
    ];

    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
          readConfirmations: {
            where: { userId },
            select: { id: true, readAt: true },
          },
        },
        orderBy: [
          { isPinned: "desc" },
          { priority: "desc" },
          { publishAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.announcement.count({ where }),
    ]);

    // Add read status
    const dataWithReadStatus = data.map((announcement) => ({
      ...announcement,
      isRead: announcement.readConfirmations.length > 0,
      readConfirmations: undefined,
    }));

    return {
      data: dataWithReadStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createAnnouncement(dto: CreateAnnouncementDto, userId: string) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        content: dto.content,
        priority: dto.priority || AnnouncementPriority.NORMAL,
        isPinned: dto.isPinned || false,
        createdById: userId,
        publishAt: dto.publishAt ? new Date(dto.publishAt) : new Date(),
        expireAt: dto.expireAt ? new Date(dto.expireAt) : null,
        targetRoles: dto.targetRoles ? JSON.stringify(dto.targetRoles) : null,
      },
    });

    // Notify users (if publishing now)
    if (!dto.publishAt || new Date(dto.publishAt) <= new Date()) {
      const whereUser: any = { isActive: true };
      if (dto.targetRoles && dto.targetRoles.length > 0) {
        whereUser.role = { in: dto.targetRoles };
      }

      const users = await this.prisma.user.findMany({
        where: whereUser,
        select: { id: true },
      });

      // Optimized: Use createMany instead of N individual creates
      if (users.length > 0) {
        await this.prisma.notification.createMany({
          data: users.map((user) => ({
            userId: user.id,
            type: NotificationType.ANNOUNCEMENT_NEW,
            title: "新公告",
            message: dto.title,
            metadata: JSON.stringify({ announcementId: announcement.id }),
          })),
        });
      }
    }

    return announcement;
  }

  async updateAnnouncement(id: string, dto: UpdateAnnouncementDto) {
    return this.prisma.announcement.update({
      where: { id },
      data: {
        ...dto,
        publishAt: dto.publishAt ? new Date(dto.publishAt) : undefined,
        expireAt: dto.expireAt ? new Date(dto.expireAt) : undefined,
        targetRoles: dto.targetRoles
          ? JSON.stringify(dto.targetRoles)
          : undefined,
      },
    });
  }

  async markAnnouncementRead(announcementId: string, userId: string) {
    const existing = await this.prisma.announcementReadConfirmation.findUnique({
      where: {
        announcementId_userId: { announcementId, userId },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.announcementReadConfirmation.create({
      data: { announcementId, userId },
    });
  }

  // ==================== Stats ====================

  async getDocumentStats(userId: string) {
    const [
      totalDocuments,
      publishedDocuments,
      draftDocuments,
      myUnreadDocuments,
      activeAnnouncements,
    ] = await Promise.all([
      this.prisma.document.count({ where: { isActive: true } }),
      this.prisma.document.count({
        where: { isActive: true, status: DocumentStatus.PUBLISHED },
      }),
      this.prisma.document.count({
        where: { isActive: true, status: DocumentStatus.DRAFT },
      }),
      this.getMyUnreadDocuments(userId).then((docs) => docs.length),
      this.prisma.announcement.count({
        where: {
          isActive: true,
          publishAt: { lte: new Date() },
          OR: [{ expireAt: null }, { expireAt: { gt: new Date() } }],
        },
      }),
    ]);

    return {
      totalDocuments,
      publishedDocuments,
      draftDocuments,
      myUnreadDocuments,
      activeAnnouncements,
    };
  }
}

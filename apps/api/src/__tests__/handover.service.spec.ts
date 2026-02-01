import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { HandoverService } from "../handover/handover.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { AuditService } from "../audit/audit.service";
import { CacheService } from "../common/cache/cache.service";
import { HandoverStatus, HandoverPriority, Role } from "../shared";

describe("HandoverService", () => {
  let service: HandoverService;
  let prismaService: jest.Mocked<PrismaService>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let auditService: jest.Mocked<AuditService>;

  const mockPrismaService = {
    handover: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    handoverComment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    taskCategory: {
      findMany: jest.fn(),
    },
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  const mockAuditService = {
    create: jest.fn(),
  };

  const mockCacheService = {
    wrap: jest.fn((key, fn) => fn()),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandoverService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<HandoverService>(HandoverService);
    prismaService = module.get(PrismaService);
    notificationsService = module.get(NotificationsService);
    auditService = module.get(AuditService);

    jest.clearAllMocks();
  });

  describe("findOne", () => {
    it("should return a handover when found", async () => {
      const mockHandover = {
        id: "handover-1",
        title: "Test Handover",
        content: "Test content",
        status: HandoverStatus.PENDING,
        priority: HandoverPriority.MEDIUM,
        createdById: "user-1",
        createdBy: { id: "user-1", name: "Test User" },
      };

      mockPrismaService.handover.findUnique.mockResolvedValue(mockHandover);

      const result = await service.findOne("handover-1");

      expect(result).toEqual(mockHandover);
      expect(mockPrismaService.handover.findUnique).toHaveBeenCalledWith({
        where: { id: "handover-1" },
        include: expect.any(Object),
      });
    });

    it("should throw NotFoundException when handover not found", async () => {
      mockPrismaService.handover.findUnique.mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("create", () => {
    it("should create a new handover successfully", async () => {
      const createDto = {
        title: "New Handover",
        content: "Handover content",
        priority: HandoverPriority.HIGH,
        assigneeId: "user-2",
      };

      const mockCreatedHandover = {
        id: "new-handover-1",
        ...createDto,
        status: HandoverStatus.PENDING,
        createdById: "user-1",
      };

      mockPrismaService.handover.create.mockResolvedValue(mockCreatedHandover);
      mockNotificationsService.create.mockResolvedValue(undefined);
      mockAuditService.create.mockResolvedValue(undefined);

      const result = await service.create(createDto, "user-1");

      expect(result.title).toBe("New Handover");
      expect(mockPrismaService.handover.create).toHaveBeenCalled();
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should allow owner to update", async () => {
      const mockHandover = {
        id: "handover-1",
        title: "Test",
        status: HandoverStatus.PENDING,
        createdById: "user-1",
        assigneeId: null,
      };

      const mockUser = { id: "user-1", role: Role.STAFF };

      mockPrismaService.handover.findUnique.mockResolvedValue(mockHandover);
      mockPrismaService.handover.update.mockResolvedValue({
        ...mockHandover,
        status: HandoverStatus.IN_PROGRESS,
      });

      const result = await service.update(
        "handover-1",
        { status: HandoverStatus.IN_PROGRESS },
        mockUser,
      );

      expect(result.status).toBe(HandoverStatus.IN_PROGRESS);
    });

    it("should allow assignee to update", async () => {
      const mockHandover = {
        id: "handover-1",
        title: "Test",
        status: HandoverStatus.PENDING,
        createdById: "user-1",
        assigneeId: "user-2",
      };

      const mockUser = { id: "user-2", role: Role.STAFF };

      mockPrismaService.handover.findUnique.mockResolvedValue(mockHandover);
      mockPrismaService.handover.update.mockResolvedValue({
        ...mockHandover,
        status: HandoverStatus.COMPLETED,
      });

      const result = await service.update(
        "handover-1",
        { status: HandoverStatus.COMPLETED },
        mockUser,
      );

      expect(result.status).toBe(HandoverStatus.COMPLETED);
    });

    it("should throw ForbiddenException for unauthorized user", async () => {
      const mockHandover = {
        id: "handover-1",
        title: "Test",
        status: HandoverStatus.PENDING,
        createdById: "user-1",
        assigneeId: "user-2",
      };

      const mockUser = { id: "user-3", role: Role.STAFF };

      mockPrismaService.handover.findUnique.mockResolvedValue(mockHandover);

      await expect(
        service.update(
          "handover-1",
          { status: HandoverStatus.COMPLETED },
          mockUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow admin to update any handover", async () => {
      const mockHandover = {
        id: "handover-1",
        title: "Test",
        status: HandoverStatus.PENDING,
        createdById: "user-1",
        assigneeId: "user-2",
      };

      const mockUser = { id: "admin-1", role: Role.ADMIN };

      mockPrismaService.handover.findUnique.mockResolvedValue(mockHandover);
      mockPrismaService.handover.update.mockResolvedValue({
        ...mockHandover,
        status: HandoverStatus.COMPLETED,
      });

      const result = await service.update(
        "handover-1",
        { status: HandoverStatus.COMPLETED },
        mockUser,
      );

      expect(result.status).toBe(HandoverStatus.COMPLETED);
    });
  });

  describe("addComment", () => {
    it("should add a comment to handover", async () => {
      const mockHandover = {
        id: "handover-1",
        title: "Test",
        createdById: "user-1",
        assigneeId: "user-2",
      };

      const mockComment = {
        id: "comment-1",
        content: "Test comment",
        handoverId: "handover-1",
        authorId: "user-1",
        createdAt: new Date(),
        author: {
          id: "user-1",
          name: "Test User",
          role: "STAFF",
        },
      };

      mockPrismaService.handover.findUnique.mockResolvedValue(mockHandover);
      mockPrismaService.handoverComment.create.mockResolvedValue(mockComment);

      const result = await service.addComment(
        "handover-1",
        "Test comment",
        "user-1",
      );

      expect(result.content).toBe("Test comment");
      expect(mockPrismaService.handoverComment.create).toHaveBeenCalled();
    });
  });
});

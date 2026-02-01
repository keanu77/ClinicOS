import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "../notifications/notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationType } from "../shared";

describe("NotificationsService", () => {
  let notificationsService: NotificationsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    notification: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    notificationsService =
      module.get<NotificationsService>(NotificationsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return paginated notifications with unread count", async () => {
      const mockNotifications = [
        { id: "1", title: "Notification 1", isRead: false },
        { id: "2", title: "Notification 2", isRead: true },
      ];

      mockPrismaService.notification.findMany.mockResolvedValue(
        mockNotifications,
      );
      mockPrismaService.notification.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(5); // unread

      const result = await notificationsService.findAll("user-1", {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(10);
      expect(result.unreadCount).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("should filter by isRead when provided", async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([]);
      mockPrismaService.notification.count.mockResolvedValue(0);

      await notificationsService.findAll("user-1", { isRead: false });

      expect(mockPrismaService.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1", isRead: false },
        }),
      );
    });
  });

  describe("create", () => {
    it("should create a notification with metadata", async () => {
      const mockNotification = {
        id: "notif-1",
        userId: "user-1",
        type: NotificationType.HANDOVER_ASSIGNED,
        title: "New Task",
        message: "You have a new task",
        metadata: JSON.stringify({ handoverId: "task-1" }),
      };

      mockPrismaService.notification.create.mockResolvedValue(mockNotification);

      const result = await notificationsService.create({
        userId: "user-1",
        type: NotificationType.HANDOVER_ASSIGNED,
        title: "New Task",
        message: "You have a new task",
        metadata: { handoverId: "task-1" },
      });

      expect(result.id).toBe("notif-1");
      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          type: NotificationType.HANDOVER_ASSIGNED,
          title: "New Task",
          message: "You have a new task",
          metadata: JSON.stringify({ handoverId: "task-1" }),
        },
      });
    });

    it("should create a notification without metadata", async () => {
      mockPrismaService.notification.create.mockResolvedValue({
        id: "notif-2",
      });

      await notificationsService.create({
        userId: "user-1",
        type: NotificationType.INVENTORY_LOW_STOCK,
        title: "Low Stock",
        message: "Item is low on stock",
      });

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: null,
        }),
      });
    });
  });

  describe("markAsRead", () => {
    it("should mark a notification as read", async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 1 });

      await notificationsService.markAsRead("notif-1", "user-1");

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { id: "notif-1", userId: "user-1" },
        data: { isRead: true },
      });
    });
  });

  describe("markAllAsRead", () => {
    it("should mark all unread notifications as read", async () => {
      mockPrismaService.notification.updateMany.mockResolvedValue({ count: 5 });

      await notificationsService.markAllAsRead("user-1");

      expect(mockPrismaService.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1", isRead: false },
        data: { isRead: true },
      });
    });
  });

  describe("getUnreadCount", () => {
    it("should return the count of unread notifications", async () => {
      mockPrismaService.notification.count.mockResolvedValue(7);

      const result = await notificationsService.getUnreadCount("user-1");

      expect(result).toBe(7);
      expect(mockPrismaService.notification.count).toHaveBeenCalledWith({
        where: { userId: "user-1", isRead: false },
      });
    });
  });

  describe("delete", () => {
    it("should delete a notification", async () => {
      mockPrismaService.notification.deleteMany.mockResolvedValue({ count: 1 });

      await notificationsService.delete("notif-1", "user-1");

      expect(mockPrismaService.notification.deleteMany).toHaveBeenCalledWith({
        where: { id: "notif-1", userId: "user-1" },
      });
    });
  });
});

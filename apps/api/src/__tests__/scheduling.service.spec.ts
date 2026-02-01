import { Test, TestingModule } from "@nestjs/testing";
import { SchedulingService } from "../scheduling/scheduling.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ShiftType } from "../shared";

describe("SchedulingService", () => {
  let schedulingService: SchedulingService;
  let prismaService: jest.Mocked<PrismaService>;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockPrismaService = {
    shift: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    schedulingService = module.get<SchedulingService>(SchedulingService);
    prismaService = module.get(PrismaService);
    notificationsService = module.get(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getTodayShifts", () => {
    it("should return today's shifts", async () => {
      const mockShifts = [
        {
          id: "1",
          date: new Date(),
          type: ShiftType.MORNING,
          user: { name: "John" },
        },
        {
          id: "2",
          date: new Date(),
          type: ShiftType.AFTERNOON,
          user: { name: "Jane" },
        },
      ];

      mockPrismaService.shift.findMany.mockResolvedValue(mockShifts);

      const result = await schedulingService.getTodayShifts();

      expect(result).toHaveLength(2);
      expect(mockPrismaService.shift.findMany).toHaveBeenCalled();
    });
  });

  describe("getWeeklySchedule", () => {
    it("should return weekly schedule grouped by date", async () => {
      const mockShifts = [
        {
          id: "1",
          date: new Date("2024-01-15"),
          type: ShiftType.MORNING,
          userId: "user-1",
          user: { id: "user-1", name: "John" },
        },
      ];

      mockPrismaService.shift.findMany.mockResolvedValue(mockShifts);

      const result = await schedulingService.getWeeklySchedule(
        new Date("2024-01-15"),
      );

      expect(result).toBeDefined();
      expect(result.schedule).toHaveLength(7);
      expect(mockPrismaService.shift.findMany).toHaveBeenCalled();
    });
  });

  describe("create", () => {
    it("should create a new shift successfully", async () => {
      const mockShift = {
        id: "shift-1",
        date: new Date("2024-01-15"),
        type: ShiftType.MORNING,
        userId: "user-1",
        user: { id: "user-1", name: "John" },
      };

      mockPrismaService.shift.findUnique.mockResolvedValue(null);
      mockPrismaService.shift.create.mockResolvedValue(mockShift);
      mockNotificationsService.create.mockResolvedValue(undefined as any);

      const result = await schedulingService.create({
        date: "2024-01-15",
        type: ShiftType.MORNING,
        userId: "user-1",
      });

      expect(result.id).toBe("shift-1");
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });

    it("should throw BadRequestException if shift already exists", async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue({
        id: "existing-shift",
      });

      await expect(
        schedulingService.create({
          date: "2024-01-15",
          type: ShiftType.MORNING,
          userId: "user-1",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getUserShifts", () => {
    it("should return shifts for a specific user", async () => {
      const mockShifts = [
        { id: "1", date: new Date(), type: ShiftType.MORNING },
        { id: "2", date: new Date(), type: ShiftType.AFTERNOON },
      ];

      mockPrismaService.shift.findMany.mockResolvedValue(mockShifts);

      const result = await schedulingService.getUserShifts("user-1");

      expect(result).toHaveLength(2);
      expect(mockPrismaService.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
        }),
      );
    });

    it("should filter by month when provided", async () => {
      mockPrismaService.shift.findMany.mockResolvedValue([]);

      await schedulingService.getUserShifts("user-1", "2024-01");

      expect(mockPrismaService.shift.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-1",
            date: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe("findById", () => {
    it("should return a shift by id", async () => {
      const mockShift = {
        id: "shift-1",
        date: new Date(),
        type: ShiftType.MORNING,
        userId: "user-1",
        user: { id: "user-1", name: "John" },
        handovers: [],
      };

      mockPrismaService.shift.findUnique.mockResolvedValue(mockShift);

      const result = await schedulingService.findById("shift-1");

      expect(result.id).toBe("shift-1");
    });

    it("should throw NotFoundException if shift not found", async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(null);

      await expect(schedulingService.findById("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("delete", () => {
    it("should delete a shift", async () => {
      const mockShift = { id: "shift-1", userId: "user-1" };
      mockPrismaService.shift.findUnique.mockResolvedValue(mockShift);
      mockPrismaService.shift.delete.mockResolvedValue(mockShift);

      const result = await schedulingService.delete("shift-1");

      expect(result.id).toBe("shift-1");
      expect(mockPrismaService.shift.delete).toHaveBeenCalledWith({
        where: { id: "shift-1" },
      });
    });

    it("should throw NotFoundException if shift not found", async () => {
      mockPrismaService.shift.findUnique.mockResolvedValue(null);

      await expect(schedulingService.delete("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update a shift and notify users", async () => {
      const existingShift = {
        id: "shift-1",
        date: new Date("2024-01-15"),
        type: ShiftType.MORNING,
        userId: "user-1",
        user: { id: "user-1", name: "John" },
        handovers: [],
      };

      const updatedShift = {
        ...existingShift,
        type: ShiftType.AFTERNOON,
      };

      mockPrismaService.shift.findUnique.mockResolvedValue(existingShift);
      mockPrismaService.shift.update.mockResolvedValue(updatedShift);
      mockNotificationsService.create.mockResolvedValue(undefined as any);

      const result = await schedulingService.update("shift-1", {
        type: ShiftType.AFTERNOON,
      });

      expect(result.type).toBe(ShiftType.AFTERNOON);
      expect(mockNotificationsService.create).toHaveBeenCalled();
    });
  });
});

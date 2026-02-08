import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { InventoryService } from "../inventory/inventory.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { InventoryTxnType, InventoryCategory } from "../shared";

describe("InventoryService", () => {
  let service: InventoryService;
  let prismaService: jest.Mocked<PrismaService>;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockPrismaService = {
    inventoryItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    inventoryTxn: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prismaService = module.get(PrismaService);
    notificationsService = module.get(NotificationsService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("findItemById", () => {
    it("should return an item when found", async () => {
      const mockItem = {
        id: "item-1",
        name: "Test Item",
        category: InventoryCategory.OTHER,
        quantity: 100,
        minStock: 10,
        isActive: true,
        transactions: [],
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(mockItem);

      const result = await service.findItemById("item-1");

      expect(result).toEqual(mockItem);
      expect(mockPrismaService.inventoryItem.findUnique).toHaveBeenCalledWith({
        where: { id: "item-1" },
        include: expect.any(Object),
      });
    });

    it("should throw NotFoundException when item not found", async () => {
      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(null);

      await expect(service.findItemById("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("createItem", () => {
    it("should create a new item successfully", async () => {
      const createDto = {
        name: "New Item",
        category: InventoryCategory.OTHER,
        quantity: 50,
        minStock: 10,
      };

      mockPrismaService.inventoryItem.create.mockResolvedValue({
        id: "new-item-1",
        ...createDto,
        isActive: true,
      });

      const result = await service.createItem(createDto);

      expect(result.name).toBe("New Item");
      expect(mockPrismaService.inventoryItem.create).toHaveBeenCalled();
    });
  });

  describe("createTransaction", () => {
    it("should create an IN transaction and increase quantity", async () => {
      const mockItem = {
        id: "item-1",
        name: "Test Item",
        quantity: 100,
        minStock: 10,
      };

      const createTxnDto = {
        itemId: "item-1",
        type: InventoryTxnType.IN,
        quantity: 20,
        note: "Restocking",
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(mockItem);
      mockPrismaService.$transaction.mockResolvedValue([
        { id: "txn-1", ...createTxnDto, item: mockItem },
        { ...mockItem, quantity: 120 },
      ]);

      const result = await service.createTransaction(createTxnDto, "user-1");

      expect(result.id).toBe("txn-1");
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it("should throw BadRequestException when insufficient stock for OUT", async () => {
      const mockItem = {
        id: "item-1",
        name: "Test Item",
        quantity: 5,
        minStock: 10,
        transactions: [],
      };

      const createTxnDto = {
        itemId: "item-1",
        type: InventoryTxnType.OUT,
        quantity: 10,
      };

      mockPrismaService.inventoryItem.findUnique.mockResolvedValue(mockItem);

      await expect(
        service.createTransaction(createTxnDto, "user-1"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("getLowStockItems", () => {
    it("should return items with low stock using raw SQL", async () => {
      const mockLowStockItems = [
        { id: "item-1", name: "Low Stock Item", quantity: 5, minStock: 10 },
      ];

      mockPrismaService.$queryRaw.mockResolvedValue(mockLowStockItems);

      const result = await service.getLowStockItems();

      expect(result).toHaveLength(1);
      expect(result[0].shortage).toBe(5);
    });
  });
});

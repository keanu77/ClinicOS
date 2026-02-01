import { Test, TestingModule } from "@nestjs/testing";
import { FinanceService } from "../finance/finance.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CacheService } from "../common/cache/cache.service";
import { CostType } from "../shared";

describe("FinanceService", () => {
  let financeService: FinanceService;
  let prismaService: jest.Mocked<PrismaService>;
  let cacheService: jest.Mocked<CacheService>;

  const mockPrismaService = {
    costCategory: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    costEntry: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    revenueEntry: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    costSnapshot: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
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
        FinanceService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    financeService = module.get<FinanceService>(FinanceService);
    prismaService = module.get(PrismaService);
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCostCategories", () => {
    it("should return cached cost categories", async () => {
      const mockCategories = [
        { id: "1", name: "Rent", type: CostType.FIXED },
        { id: "2", name: "Supplies", type: CostType.VARIABLE },
      ];

      mockCacheService.wrap.mockImplementation((key, fn) => {
        return Promise.resolve(mockCategories);
      });

      const result = await financeService.getCostCategories();

      expect(result).toEqual(mockCategories);
      expect(mockCacheService.wrap).toHaveBeenCalled();
    });
  });

  describe("getSummary", () => {
    it("should calculate financial summary correctly", async () => {
      mockPrismaService.costEntry.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 50000 } }) // total cost
        .mockResolvedValueOnce({ _sum: { amount: 30000 } }) // fixed costs
        .mockResolvedValueOnce({ _sum: { amount: 20000 } }); // variable costs

      mockPrismaService.revenueEntry.aggregate.mockResolvedValue({
        _sum: { amount: 100000 },
      });

      const result = await financeService.getSummary({});

      expect(result.totalRevenue).toBe(100000);
      expect(result.totalCost).toBe(50000);
      expect(result.grossProfit).toBe(50000);
      expect(result.grossMargin).toBe(50);
    });

    it("should handle zero revenue", async () => {
      mockPrismaService.costEntry.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });
      mockPrismaService.revenueEntry.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });

      const result = await financeService.getSummary({});

      expect(result.totalRevenue).toBe(0);
      expect(result.grossMargin).toBe(0);
    });
  });

  describe("getBreakdown", () => {
    it("should return cost breakdown by category", async () => {
      const mockCategories = [
        { id: "1", name: "Rent", type: CostType.FIXED },
        { id: "2", name: "Supplies", type: CostType.VARIABLE },
      ];

      const mockCostsByCategory = [
        { categoryId: "1", _sum: { amount: 30000 } },
        { categoryId: "2", _sum: { amount: 10000 } },
      ];

      mockPrismaService.costCategory.findMany.mockResolvedValue(mockCategories);
      mockPrismaService.costEntry.groupBy.mockResolvedValue(
        mockCostsByCategory,
      );

      const result = await financeService.getBreakdown({});

      expect(result).toHaveLength(2);
      expect(result[0].amount).toBe(30000); // Sorted by amount desc
      expect(result[1].amount).toBe(10000);
    });
  });

  describe("getByDoctor", () => {
    it("should return revenue grouped by doctor", async () => {
      const mockRevenues = [
        { doctorId: "doc-1", _sum: { amount: 50000 }, _count: 10 },
        { doctorId: "doc-2", _sum: { amount: 30000 }, _count: 5 },
      ];

      const mockDoctors = [
        { id: "doc-1", name: "Dr. Smith" },
        { id: "doc-2", name: "Dr. Jones" },
      ];

      mockPrismaService.revenueEntry.groupBy.mockResolvedValue(mockRevenues);
      mockPrismaService.user.findMany.mockResolvedValue(mockDoctors);

      const result = await financeService.getByDoctor({});

      expect(result).toHaveLength(2);
      expect(result[0].revenue).toBe(50000);
      expect(result[0].doctor?.name).toBe("Dr. Smith");
    });
  });

  describe("createCostEntry", () => {
    it("should create a cost entry and audit log", async () => {
      const mockEntry = {
        id: "entry-1",
        categoryId: "cat-1",
        amount: 1000,
        description: "Office supplies",
        date: new Date(),
        category: { id: "cat-1", name: "Supplies" },
      };

      mockPrismaService.costEntry.create.mockResolvedValue(mockEntry);
      mockAuditService.create.mockResolvedValue(undefined);

      const result = await financeService.createCostEntry(
        {
          categoryId: "cat-1",
          amount: 1000,
          description: "Office supplies",
          date: "2024-01-15",
        },
        "user-1",
      );

      expect(result.id).toBe("entry-1");
      expect(mockAuditService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "COST_ENTRY_CREATE",
          userId: "user-1",
        }),
      );
    });
  });

  describe("createRevenueEntry", () => {
    it("should create a revenue entry and audit log", async () => {
      const mockEntry = {
        id: "rev-1",
        amount: 5000,
        source: "Consultation",
        date: new Date(),
      };

      mockPrismaService.revenueEntry.create.mockResolvedValue(mockEntry);
      mockAuditService.create.mockResolvedValue(undefined);

      const result = await financeService.createRevenueEntry(
        {
          amount: 5000,
          source: "Consultation",
          date: "2024-01-15",
        },
        "user-1",
      );

      expect(result.id).toBe("rev-1");
      expect(mockAuditService.create).toHaveBeenCalled();
    });
  });
});

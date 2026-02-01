import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "../dashboard/dashboard.service";
import { HandoverService } from "../handover/handover.service";
import { InventoryService } from "../inventory/inventory.service";
import { SchedulingService } from "../scheduling/scheduling.service";
import { HRService } from "../hr/hr.service";
import { AssetService } from "../asset/asset.service";
import { ProcurementService } from "../procurement/procurement.service";
import { QualityService } from "../quality/quality.service";
import { DocumentService } from "../document/document.service";
import { FinanceService } from "../finance/finance.service";

describe("DashboardService", () => {
  let dashboardService: DashboardService;
  let handoverService: jest.Mocked<HandoverService>;
  let inventoryService: jest.Mocked<InventoryService>;
  let schedulingService: jest.Mocked<SchedulingService>;

  const mockHandoverService = {
    findMyHandovers: jest.fn(),
    getUrgentHandovers: jest.fn(),
    getPendingCount: jest.fn(),
    getTaskStats: jest.fn(),
  };

  const mockInventoryService = {
    getLowStockItems: jest.fn(),
    getLowStockCount: jest.fn(),
  };

  const mockSchedulingService = {
    getTodayShifts: jest.fn(),
  };

  const mockHRService = {
    getExpiringCertifications: jest.fn(),
  };

  const mockAssetService = {
    getOpenFaults: jest.fn(),
    getUpcomingMaintenance: jest.fn(),
  };

  const mockProcurementService = {
    getPendingRequests: jest.fn(),
  };

  const mockQualityService = {
    getQualityStats: jest.fn(),
  };

  const mockDocumentService = {
    getMyUnreadDocuments: jest.fn(),
  };

  const mockFinanceService = {
    getSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: HandoverService, useValue: mockHandoverService },
        { provide: InventoryService, useValue: mockInventoryService },
        { provide: SchedulingService, useValue: mockSchedulingService },
        { provide: HRService, useValue: mockHRService },
        { provide: AssetService, useValue: mockAssetService },
        { provide: ProcurementService, useValue: mockProcurementService },
        { provide: QualityService, useValue: mockQualityService },
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: FinanceService, useValue: mockFinanceService },
      ],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
    handoverService = module.get(HandoverService);
    inventoryService = module.get(InventoryService);
    schedulingService = module.get(SchedulingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getSummary", () => {
    it("should return summary for staff user", async () => {
      const staffUser = { id: "user-1", role: "STAFF" };

      mockSchedulingService.getTodayShifts.mockResolvedValue([]);
      mockHandoverService.findMyHandovers.mockResolvedValue([
        { id: "1", title: "Task 1" },
      ]);
      mockInventoryService.getLowStockCount.mockResolvedValue(5);
      mockHandoverService.getPendingCount.mockResolvedValue(10);

      const result = await dashboardService.getSummary(staffUser);

      expect(result.todayShifts).toEqual([]);
      expect(result.myHandovers).toHaveLength(1);
      expect(result.pendingHandoversCount).toBe(10);
      expect(result.lowStockCount).toBe(5);
      expect(result.urgentHandovers).toBeUndefined();
      expect(result.lowStockItems).toBeUndefined();
    });

    it("should return extended summary for admin user", async () => {
      const adminUser = { id: "admin-1", role: "ADMIN" };
      const lowStockItems = [
        { id: "1", name: "Item 1" },
        { id: "2", name: "Item 2" },
      ];

      mockSchedulingService.getTodayShifts.mockResolvedValue([]);
      mockHandoverService.findMyHandovers.mockResolvedValue([]);
      mockHandoverService.getUrgentHandovers.mockResolvedValue([
        { id: "urgent-1" },
      ]);
      mockInventoryService.getLowStockItems.mockResolvedValue(lowStockItems);
      mockHandoverService.getPendingCount.mockResolvedValue(3);

      const result = await dashboardService.getSummary(adminUser);

      expect(result.lowStockCount).toBe(2);
      expect(result.urgentHandovers).toHaveLength(1);
      expect(result.lowStockItems).toEqual(lowStockItems);
    });

    it("should return extended summary for supervisor user", async () => {
      const supervisorUser = { id: "supervisor-1", role: "SUPERVISOR" };

      mockSchedulingService.getTodayShifts.mockResolvedValue([]);
      mockHandoverService.findMyHandovers.mockResolvedValue([]);
      mockHandoverService.getUrgentHandovers.mockResolvedValue([]);
      mockInventoryService.getLowStockItems.mockResolvedValue([]);
      mockHandoverService.getPendingCount.mockResolvedValue(0);

      const result = await dashboardService.getSummary(supervisorUser);

      expect(result.urgentHandovers).toBeDefined();
      expect(result.lowStockItems).toBeDefined();
    });
  });

  describe("getStats", () => {
    it("should return pending handovers and low stock counts", async () => {
      mockHandoverService.getPendingCount.mockResolvedValue(15);
      mockInventoryService.getLowStockCount.mockResolvedValue(8);

      const result = await dashboardService.getStats();

      expect(result.pendingHandovers).toBe(15);
      expect(result.lowStockItems).toBe(8);
    });
  });
});

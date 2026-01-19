import { Injectable } from "@nestjs/common";
import { HandoverService } from "../handover/handover.service";
import { InventoryService } from "../inventory/inventory.service";
import { SchedulingService } from "../scheduling/scheduling.service";
import { HRService } from "../hr/hr.service";
import { AssetService } from "../asset/asset.service";
import { ProcurementService } from "../procurement/procurement.service";
import { QualityService } from "../quality/quality.service";
import { DocumentService } from "../document/document.service";
import { FinanceService } from "../finance/finance.service";
import { Role } from "../shared";

@Injectable()
export class DashboardService {
  constructor(
    private handoverService: HandoverService,
    private inventoryService: InventoryService,
    private schedulingService: SchedulingService,
    private hrService: HRService,
    private assetService: AssetService,
    private procurementService: ProcurementService,
    private qualityService: QualityService,
    private documentService: DocumentService,
    private financeService: FinanceService,
  ) {}

  async getSummary(user: { id: string; role: string }) {
    const isSupervisorOrAdmin = [Role.SUPERVISOR, Role.ADMIN].includes(
      user.role as Role,
    );

    // 根據角色決定是否需要完整的低庫存列表
    const [
      todayShifts,
      myHandovers,
      urgentHandovers,
      lowStockData,
      pendingCount,
    ] = await Promise.all([
      this.schedulingService.getTodayShifts(),
      this.handoverService.findMyHandovers(user.id),
      isSupervisorOrAdmin
        ? this.handoverService.getUrgentHandovers()
        : Promise.resolve([]),
      isSupervisorOrAdmin
        ? this.inventoryService.getLowStockItems()
        : this.inventoryService.getLowStockCount(),
      this.handoverService.getPendingCount(),
    ]);

    const summary: any = {
      todayShifts,
      myHandovers,
      pendingHandoversCount: pendingCount,
      lowStockCount: isSupervisorOrAdmin
        ? (lowStockData as any[]).length
        : (lowStockData as number),
    };

    // Add more data for supervisor+
    if (isSupervisorOrAdmin) {
      summary.urgentHandovers = urgentHandovers;
      summary.lowStockItems = lowStockData;
    }

    return summary;
  }

  async getStats() {
    const [pendingCount, lowStockCount] = await Promise.all([
      this.handoverService.getPendingCount(),
      this.inventoryService.getLowStockCount(),
    ]);

    return {
      pendingHandovers: pendingCount,
      lowStockItems: lowStockCount,
    };
  }

  async getOperationsDashboard(userId: string) {
    const [
      // 任務狀態
      taskStats,
      // 設備狀態
      openFaults,
      upcomingMaintenance,
      // 人力狀態
      expiringCertifications,
      // 庫存與採購
      lowStockItems,
      pendingPRs,
      // 品質指標
      qualityStats,
      // 財務概況
      financeSummary,
      // 文件狀態
      myUnreadDocs,
    ] = await Promise.all([
      this.handoverService.getTaskStats(),
      this.assetService.getOpenFaults(),
      this.assetService.getUpcomingMaintenance(),
      this.hrService.getExpiringCertifications(90),
      this.inventoryService.getLowStockItems(),
      this.procurementService.getPendingRequests(),
      this.qualityService.getQualityStats(),
      this.financeService.getSummary({}),
      this.documentService.getMyUnreadDocuments(userId),
    ]);

    return {
      // 本週營運
      operations: {
        totalTasks: taskStats.pending + taskStats.inProgress + taskStats.blocked,
        pendingTasks: taskStats.pending,
        inProgressTasks: taskStats.inProgress,
        completedTasks: taskStats.completedThisWeek,
      },
      // 設備狀況
      equipment: {
        openFaultsCount: (openFaults as any[]).length,
        upcomingMaintenanceCount: (upcomingMaintenance as any[]).length,
        openFaults: (openFaults as any[]).slice(0, 5),
        upcomingMaintenance: (upcomingMaintenance as any[]).slice(0, 5),
      },
      // 人力狀況
      hr: {
        expiringCertificationsCount: (expiringCertifications as any[]).length,
        expiringCertifications: (expiringCertifications as any[]).slice(0, 5),
      },
      // 庫存與採購
      inventory: {
        lowStockCount: (lowStockItems as any[]).length,
        pendingPRsCount: (pendingPRs as any).data?.length || 0,
        lowStockItems: (lowStockItems as any[]).slice(0, 5),
      },
      // 品質指標
      quality: {
        openIncidents: qualityStats.openIncidents,
        monthlyIncidents: qualityStats.monthlyIncidents,
        openComplaints: qualityStats.openComplaints,
      },
      // 財務概況
      finance: {
        totalRevenue: financeSummary.totalRevenue,
        totalCost: financeSummary.totalCost,
        grossProfit: financeSummary.grossProfit,
        grossMargin: financeSummary.grossMargin,
      },
      // 文件待辦
      documents: {
        unreadCount: (myUnreadDocs as any[]).length,
      },
    };
  }
}

import { Injectable } from '@nestjs/common';
import { HandoverService } from '../handover/handover.service';
import { InventoryService } from '../inventory/inventory.service';
import { SchedulingService } from '../scheduling/scheduling.service';
import { Role } from '../shared';

@Injectable()
export class DashboardService {
  constructor(
    private handoverService: HandoverService,
    private inventoryService: InventoryService,
    private schedulingService: SchedulingService,
  ) {}

  async getSummary(user: { id: string; role: string }) {
    const isSupervisorOrAdmin = [Role.SUPERVISOR, Role.ADMIN].includes(user.role as Role);

    // 根據角色決定是否需要完整的低庫存列表
    const [todayShifts, myHandovers, urgentHandovers, lowStockData, pendingCount] =
      await Promise.all([
        this.schedulingService.getTodayShifts(),
        this.handoverService.findMyHandovers(user.id),
        isSupervisorOrAdmin ? this.handoverService.getUrgentHandovers() : Promise.resolve([]),
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
}

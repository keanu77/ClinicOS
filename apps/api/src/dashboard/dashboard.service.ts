import { Injectable } from '@nestjs/common';
import { HandoverService } from '../handover/handover.service';
import { InventoryService } from '../inventory/inventory.service';
import { SchedulingService } from '../scheduling/scheduling.service';
import { Role } from '@clinic-os/shared';

@Injectable()
export class DashboardService {
  constructor(
    private handoverService: HandoverService,
    private inventoryService: InventoryService,
    private schedulingService: SchedulingService,
  ) {}

  async getSummary(user: { id: string; role: string }) {
    const [todayShifts, myHandovers, urgentHandovers, lowStockItems, pendingCount] =
      await Promise.all([
        this.schedulingService.getTodayShifts(),
        this.handoverService.findMyHandovers(user.id),
        this.handoverService.getUrgentHandovers(),
        this.inventoryService.getLowStockItems(),
        this.handoverService.getPendingCount(),
      ]);

    const summary: any = {
      todayShifts,
      myHandovers,
      pendingHandoversCount: pendingCount,
      lowStockCount: lowStockItems.length,
    };

    // Add more data for supervisor+
    if ([Role.SUPERVISOR, Role.ADMIN].includes(user.role as Role)) {
      summary.urgentHandovers = urgentHandovers;
      summary.lowStockItems = lowStockItems;
    }

    return summary;
  }

  async getStats() {
    const [pendingCount, lowStockCount] = await Promise.all([
      this.handoverService.getPendingCount(),
      this.inventoryService.getLowStockItems().then((items) => items.length),
    ]);

    return {
      pendingHandovers: pendingCount,
      lowStockItems: lowStockCount,
    };
  }
}

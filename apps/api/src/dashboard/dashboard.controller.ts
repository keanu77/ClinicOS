import { Controller, Get } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("dashboard")
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get("summary")
  getSummary(@CurrentUser() user: { id: string; role: string }) {
    return this.dashboardService.getSummary(user);
  }

  @Get("stats")
  getStats() {
    return this.dashboardService.getStats();
  }
}

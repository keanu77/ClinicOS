import { Controller, Get, UseGuards } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { Role } from "../shared";

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

  @Get("operations")
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERVISOR)
  getOperationsDashboard(@CurrentUser("id") userId: string) {
    return this.dashboardService.getOperationsDashboard(userId);
  }
}

import { Controller, Get, Logger } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";
import { PrismaService } from "./prisma/prisma.service";

@Controller("health")
export class HealthController {
  private readonly logger = new Logger(HealthController.name);
  private readonly startTime = Date.now();

  constructor(private prisma: PrismaService) {}

  @Public()
  @Get()
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      version: process.env.npm_package_version || "1.0.0",
    };
  }

  @Public()
  @Get("ready")
  async readinessCheck() {
    const checks: Record<string, { status: string; message?: string }> = {};

    // Database check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: "healthy" };
    } catch (error) {
      this.logger.error("Database health check failed", error);
      checks.database = {
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Memory check
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const heapPercentage = (heapUsedMB / heapTotalMB) * 100;

    checks.memory = {
      status: heapPercentage < 90 ? "healthy" : "warning",
      message: `${heapUsedMB}MB / ${heapTotalMB}MB (${heapPercentage.toFixed(1)}%)`,
    };

    const overallStatus = Object.values(checks).every(
      (c) => c.status !== "unhealthy",
    )
      ? "ok"
      : "degraded";

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: this.getUptime(),
      checks,
    };
  }

  @Public()
  @Get("live")
  livenessCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  private getUptime(): string {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}

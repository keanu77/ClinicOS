import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { PrismaModule } from "./prisma/prisma.module";
import { CacheModule } from "./common/cache/cache.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { HandoverModule } from "./handover/handover.module";
import { InventoryModule } from "./inventory/inventory.module";
import { SchedulingModule } from "./scheduling/scheduling.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { AuditModule } from "./audit/audit.module";
import { HRModule } from "./hr/hr.module";
import { AssetModule } from "./asset/asset.module";
import { ProcurementModule } from "./procurement/procurement.module";
import { QualityModule } from "./quality/quality.module";
import { DocumentModule } from "./document/document.module";
import { FinanceModule } from "./finance/finance.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", ".env.local"],
    }),
    // Structured logging with Pino
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.get("LOG_LEVEL", "info"),
          transport:
            configService.get("NODE_ENV") !== "production"
              ? {
                  target: "pino-pretty",
                  options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                  },
                }
              : undefined,
          autoLogging: {
            ignore: (req: any) =>
              req.url === "/api/health" || req.url === "/api/health/ready",
          },
          customProps: () => ({
            context: "HTTP",
          }),
          customSuccessMessage: (req: any, res: any) =>
            `${req.method} ${req.url} ${res.statusCode}`,
          customErrorMessage: (req: any, res: any, err: any) =>
            `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
        },
      }),
    }),
    // 速率限制配置
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000, // 1 秒
        limit: 10, // 每秒最多 10 次請求
      },
      {
        name: "medium",
        ttl: 10000, // 10 秒
        limit: 50, // 每 10 秒最多 50 次請求
      },
      {
        name: "long",
        ttl: 60000, // 1 分鐘
        limit: 200, // 每分鐘最多 200 次請求
      },
    ]),
    PrismaModule,
    CacheModule,
    AuthModule,
    UsersModule,
    HandoverModule,
    InventoryModule,
    SchedulingModule,
    DashboardModule,
    NotificationsModule,
    AuditModule,
    HRModule,
    AssetModule,
    ProcurementModule,
    QualityModule,
    DocumentModule,
    FinanceModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

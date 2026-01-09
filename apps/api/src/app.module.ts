import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HandoverModule } from './handover/handover.module';
import { InventoryModule } from './inventory/inventory.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    // 速率限制配置
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 秒
        limit: 10, // 每秒最多 10 次請求
      },
      {
        name: 'medium',
        ttl: 10000, // 10 秒
        limit: 50, // 每 10 秒最多 50 次請求
      },
      {
        name: 'long',
        ttl: 60000, // 1 分鐘
        limit: 200, // 每分鐘最多 200 次請求
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    HandoverModule,
    InventoryModule,
    SchedulingModule,
    DashboardModule,
    NotificationsModule,
    AuditModule,
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

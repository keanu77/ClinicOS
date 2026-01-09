import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { HandoverModule } from '../handover/handover.module';
import { InventoryModule } from '../inventory/inventory.module';
import { SchedulingModule } from '../scheduling/scheduling.module';

@Module({
  imports: [HandoverModule, InventoryModule, SchedulingModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

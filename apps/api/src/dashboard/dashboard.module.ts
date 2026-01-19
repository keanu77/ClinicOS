import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { HandoverModule } from "../handover/handover.module";
import { InventoryModule } from "../inventory/inventory.module";
import { SchedulingModule } from "../scheduling/scheduling.module";
import { HRModule } from "../hr/hr.module";
import { AssetModule } from "../asset/asset.module";
import { ProcurementModule } from "../procurement/procurement.module";
import { QualityModule } from "../quality/quality.module";
import { DocumentModule } from "../document/document.module";
import { FinanceModule } from "../finance/finance.module";

@Module({
  imports: [
    HandoverModule,
    InventoryModule,
    SchedulingModule,
    HRModule,
    AssetModule,
    ProcurementModule,
    QualityModule,
    DocumentModule,
    FinanceModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

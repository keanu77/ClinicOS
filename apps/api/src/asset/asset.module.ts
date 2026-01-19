import { Module } from "@nestjs/common";
import { AssetService } from "./asset.service";
import { AssetController } from "./asset.controller";
import { NotificationsModule } from "../notifications/notifications.module";
import { AuditModule } from "../audit/audit.module";

@Module({
  imports: [NotificationsModule, AuditModule],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}

import { Module } from "@nestjs/common";
import { QualityService } from "./quality.service";
import { QualityController } from "./quality.controller";
import { NotificationsModule } from "../notifications/notifications.module";
import { AuditModule } from "../audit/audit.module";
import { HandoverModule } from "../handover/handover.module";

@Module({
  imports: [NotificationsModule, AuditModule, HandoverModule],
  controllers: [QualityController],
  providers: [QualityService],
  exports: [QualityService],
})
export class QualityModule {}

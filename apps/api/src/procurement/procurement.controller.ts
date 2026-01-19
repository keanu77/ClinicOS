import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ProcurementService } from "./procurement.service";
import {
  CreateVendorDto,
  UpdateVendorDto,
  CreatePurchaseRequestDto,
  ApprovePRDto,
  QueryPRDto,
  CreatePurchaseOrderDto,
  QueryPODto,
  CreateGoodsReceiptDto,
} from "./dto/procurement.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../shared";

@Controller("procurement")
@UseGuards(RolesGuard)
export class ProcurementController {
  constructor(private procurementService: ProcurementService) {}

  // ==================== Vendors ====================

  @Get("vendors")
  getVendors() {
    return this.procurementService.getVendors();
  }

  @Get("vendors/:id")
  getVendor(@Param("id") id: string) {
    return this.procurementService.getVendor(id);
  }

  @Post("vendors")
  @Roles(Role.ADMIN)
  createVendor(@Body() dto: CreateVendorDto, @CurrentUser("id") userId: string) {
    return this.procurementService.createVendor(dto, userId);
  }

  @Patch("vendors/:id")
  @Roles(Role.ADMIN)
  updateVendor(@Param("id") id: string, @Body() dto: UpdateVendorDto) {
    return this.procurementService.updateVendor(id, dto);
  }

  // ==================== Purchase Requests ====================

  @Get("requests")
  getPurchaseRequests(@Query() query: QueryPRDto) {
    return this.procurementService.getPurchaseRequests(query);
  }

  @Get("requests/:id")
  getPurchaseRequest(@Param("id") id: string) {
    return this.procurementService.getPurchaseRequest(id);
  }

  @Post("requests")
  createPurchaseRequest(
    @Body() dto: CreatePurchaseRequestDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.procurementService.createPurchaseRequest(dto, userId);
  }

  @Post("requests/:id/approve")
  @Roles(Role.SUPERVISOR)
  approvePurchaseRequest(
    @Param("id") id: string,
    @Body() dto: ApprovePRDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.procurementService.approvePurchaseRequest(id, dto, user);
  }

  // ==================== Purchase Orders ====================

  @Get("orders")
  @Roles(Role.SUPERVISOR)
  getPurchaseOrders(@Query() query: QueryPODto) {
    return this.procurementService.getPurchaseOrders(query);
  }

  @Get("orders/:id")
  @Roles(Role.SUPERVISOR)
  getPurchaseOrder(@Param("id") id: string) {
    return this.procurementService.getPurchaseOrder(id);
  }

  @Post("orders")
  @Roles(Role.SUPERVISOR)
  createPurchaseOrder(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.procurementService.createPurchaseOrder(dto, userId);
  }

  // ==================== Goods Receipt ====================

  @Post("orders/:id/receive")
  @Roles(Role.SUPERVISOR)
  createGoodsReceipt(
    @Param("id") orderId: string,
    @Body() dto: Omit<CreateGoodsReceiptDto, "orderId">,
    @CurrentUser("id") userId: string,
  ) {
    return this.procurementService.createGoodsReceipt(
      { ...dto, orderId },
      userId,
    );
  }

  // ==================== Stats ====================

  @Get("stats")
  @Roles(Role.SUPERVISOR)
  getProcurementStats() {
    return this.procurementService.getProcurementStats();
  }
}

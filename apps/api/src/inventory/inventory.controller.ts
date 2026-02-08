import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { InventoryService } from "./inventory.service";
import { CreateItemDto } from "./dto/create-item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";
import { CreateTxnDto } from "./dto/create-txn.dto";
import { QueryItemDto } from "./dto/query-item.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../shared";

@Controller("inventory")
@UseGuards(RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get("items")
  findAllItems(@Query() query: QueryItemDto) {
    return this.inventoryService.findAllItems(query);
  }

  @Get("items/:id")
  findItemById(@Param("id") id: string) {
    return this.inventoryService.findItemById(id);
  }

  @Post("items")
  @Roles(Role.ADMIN)
  createItem(@Body() dto: CreateItemDto) {
    return this.inventoryService.createItem(dto);
  }

  @Patch("items/:id")
  @Roles(Role.ADMIN)
  updateItem(@Param("id") id: string, @Body() dto: UpdateItemDto) {
    return this.inventoryService.updateItem(id, dto);
  }

  @Delete("items/:id")
  @Roles(Role.ADMIN)
  deleteItem(@Param("id") id: string) {
    return this.inventoryService.deleteItem(id);
  }

  @Post("txns")
  createTransaction(
    @Body() dto: CreateTxnDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.inventoryService.createTransaction(dto, userId);
  }

  @Get("items/:id/transactions")
  getItemTransactions(
    @Param("id") id: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.inventoryService.getItemTransactions(id, page, limit);
  }

  @Get("low-stock")
  @Roles(Role.SUPERVISOR)
  getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get("export.csv")
  @Roles(Role.SUPERVISOR) // 需要 SUPERVISOR 以上權限才能導出
  async exportCsv(@Res() res: Response) {
    const csv = await this.inventoryService.exportToCsv();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=inventory-export.csv",
    );
    res.send("\uFEFF" + csv); // Add BOM for Excel compatibility
  }
}

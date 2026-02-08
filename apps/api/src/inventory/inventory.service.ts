import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { InventoryTxnType, NotificationType, Role } from "../shared";
import { CreateItemDto } from "./dto/create-item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";
import { CreateTxnDto } from "./dto/create-txn.dto";
import { QueryItemDto } from "./dto/query-item.dto";

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAllItems(query: QueryItemDto) {
    const {
      search,
      category,
      lowStock,
      isActive = true,
      page = 1,
      limit = 20,
    } = query;

    // 使用原始 SQL 處理 lowStock 查詢（比較兩個欄位）
    if (lowStock) {
      return this.findLowStockItemsPaginated(query);
    }

    const where: any = {};

    if (isActive !== undefined) where.isActive = isActive;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        orderBy: [{ name: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private async findLowStockItemsPaginated(query: QueryItemDto) {
    const { search, category, isActive = true, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    // 使用 Prisma 的安全查詢方式，避免 SQL 注入
    // 建立動態條件
    const conditions: any = {
      isActive,
    };

    if (search) {
      conditions.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (category) {
      conditions.category = category;
    }

    // 使用 Prisma 的 $queryRaw 搭配參數化查詢
    // 由於 Prisma 不支援欄位間比較，使用原始 SQL 但透過標籤模板確保安全
    const searchPattern = search ? `%${search}%` : null;

    let data: Array<{
      id: string;
      name: string;
      description: string | null;
      category: string | null;
      unit: string;
      quantity: number;
      minStock: number;
      maxStock: number | null;
      location: string | null;
      expiryDate: Date | null;
      isActive: boolean;
      vendorId: string | null;
      unitPrice: number | null;
      leadTimeDays: number | null;
      createdAt: Date;
      updatedAt: Date;
    }>;

    let countResult: [{ count: bigint }];

    if (search && category) {
      data = await this.prisma.$queryRaw`
        SELECT * FROM "InventoryItem"
        WHERE "isActive" = ${isActive}
          AND quantity <= "minStock"
          AND (name LIKE ${searchPattern} OR location LIKE ${searchPattern})
          AND category = ${category}
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "InventoryItem"
        WHERE "isActive" = ${isActive}
          AND quantity <= "minStock"
          AND (name LIKE ${searchPattern} OR location LIKE ${searchPattern})
          AND category = ${category}
      `;
    } else if (search) {
      data = await this.prisma.$queryRaw`
        SELECT * FROM "InventoryItem"
        WHERE "isActive" = ${isActive}
          AND quantity <= "minStock"
          AND (name LIKE ${searchPattern} OR location LIKE ${searchPattern})
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "InventoryItem"
        WHERE "isActive" = ${isActive}
          AND quantity <= "minStock"
          AND (name LIKE ${searchPattern} OR location LIKE ${searchPattern})
      `;
    } else if (category) {
      data = await this.prisma.$queryRaw`
        SELECT * FROM "InventoryItem"
        WHERE "isActive" = ${isActive}
          AND quantity <= "minStock"
          AND category = ${category}
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "InventoryItem"
        WHERE "isActive" = ${isActive}
          AND quantity <= "minStock"
          AND category = ${category}
      `;
    } else {
      data = await this.prisma.$queryRaw`
        SELECT * FROM "InventoryItem"
        WHERE "isActive" = ${isActive}
          AND quantity <= "minStock"
        ORDER BY name ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "InventoryItem"
        WHERE "isActive" = ${isActive}
          AND quantity <= "minStock"
      `;
    }

    const total = Number(countResult[0].count);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findItemById(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        transactions: {
          include: {
            performedBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!item) {
      throw new NotFoundException("Inventory item not found");
    }

    return item;
  }

  async createItem(dto: CreateItemDto) {
    return this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category || "OTHER",
        unit: dto.unit || "個",
        quantity: dto.quantity || 0,
        minStock: dto.minStock || 0,
        maxStock: dto.maxStock,
        location: dto.location,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
      },
    });
  }

  async updateItem(id: string, dto: UpdateItemDto) {
    await this.findItemById(id);

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        unit: dto.unit,
        minStock: dto.minStock,
        maxStock: dto.maxStock,
        location: dto.location,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : dto.expiryDate,
        isActive: dto.isActive,
      },
    });
  }

  async deleteItem(id: string) {
    await this.findItemById(id);

    // Soft delete
    return this.prisma.inventoryItem.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async createTransaction(dto: CreateTxnDto, userId: string) {
    const item = await this.findItemById(dto.itemId);

    let quantity = dto.quantity;

    // Adjust quantity sign based on type
    if (dto.type === InventoryTxnType.OUT && quantity > 0) {
      quantity = -quantity;
    }
    if (dto.type === InventoryTxnType.IN && quantity < 0) {
      quantity = Math.abs(quantity);
    }

    // Check if we have enough stock for OUT
    if (dto.type === InventoryTxnType.OUT) {
      if (item.quantity + quantity < 0) {
        throw new BadRequestException("Insufficient stock");
      }
    }

    // Use transaction to ensure consistency
    const [txn, updatedItem] = await this.prisma.$transaction([
      this.prisma.inventoryTxn.create({
        data: {
          type: dto.type,
          quantity,
          note: dto.note,
          itemId: dto.itemId,
          performedById: userId,
        },
        include: {
          item: true,
          performedBy: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prisma.inventoryItem.update({
        where: { id: dto.itemId },
        data: {
          quantity: { increment: quantity },
        },
      }),
    ]);

    // Check for low stock and notify admins
    if (updatedItem.quantity <= updatedItem.minStock) {
      await this.notifyLowStock(updatedItem);
    }

    return txn;
  }

  async getLowStockItems() {
    // 使用原始 SQL 查詢在資料庫層面過濾，避免 N+1 問題
    const items = await this.prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        quantity: number;
        minStock: number;
      }>
    >`
      SELECT id, name, quantity, "minStock"
      FROM "InventoryItem"
      WHERE "isActive" = true AND quantity <= "minStock"
      ORDER BY quantity ASC
    `;

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      minStock: item.minStock,
      shortage: item.minStock - item.quantity,
    }));
  }

  async getLowStockCount(): Promise<number> {
    // 提供一個只計算數量的方法，避免查詢完整資料
    const result = await this.prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(*) as count
      FROM "InventoryItem"
      WHERE "isActive" = true AND quantity <= minStock
    `;
    return Number(result[0].count);
  }

  async getItemTransactions(itemId: string, page = 1, limit = 20) {
    await this.findItemById(itemId);

    const [data, total] = await Promise.all([
      this.prisma.inventoryTxn.findMany({
        where: { itemId },
        include: {
          performedBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.inventoryTxn.count({ where: { itemId } }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exportToCsv() {
    const items = await this.prisma.inventoryItem.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    const headers = [
      "品項名稱",
      "分類",
      "單位",
      "庫存量",
      "最低庫存",
      "最高庫存",
      "位置",
      "狀態",
    ];

    // CSV 注入防護：轉義可能被 Excel 解釋為公式的字元
    const escapeCsvValue = (value: string): string => {
      // 如果值以危險字元開頭，添加單引號前綴
      if (/^[=+\-@\t\r]/.test(value)) {
        return `'${value}`;
      }
      // 如果值包含逗號或雙引號，需要用雙引號包裹並轉義內部雙引號
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const rows = items.map((item) => [
      escapeCsvValue(item.name),
      escapeCsvValue(item.category || "其他"),
      escapeCsvValue(item.unit),
      item.quantity.toString(),
      item.minStock.toString(),
      item.maxStock?.toString() || "",
      escapeCsvValue(item.location || ""),
      item.quantity <= item.minStock ? "低庫存" : "正常",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    return csv;
  }

  private async notifyLowStock(item: {
    id: string;
    name: string;
    quantity: number;
    minStock: number;
  }) {
    const admins = await this.prisma.user.findMany({
      where: { role: Role.ADMIN, isActive: true },
      select: { id: true },
    });

    if (admins.length === 0) return;

    await this.notificationsService.createMany(
      admins.map((admin) => ({
        userId: admin.id,
        type: NotificationType.INVENTORY_LOW_STOCK,
        title: "低庫存警示",
        message: `${item.name} 庫存低於安全存量，目前：${item.quantity}，最低：${item.minStock}`,
        metadata: { itemId: item.id },
      })),
    );
  }
}

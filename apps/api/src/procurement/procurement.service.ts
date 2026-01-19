import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { AuditService } from "../audit/audit.service";
import { InventoryService } from "../inventory/inventory.service";
import {
  Role,
  PurchaseRequestStatus,
  PurchaseOrderStatus,
  PurchasePriority,
  NotificationType,
  InventoryTxnType,
} from "../shared";
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

@Injectable()
export class ProcurementService {
  private readonly logger = new Logger(ProcurementService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
    private inventoryService: InventoryService,
  ) {}

  // ==================== Vendors ====================

  async getVendors() {
    return this.prisma.vendor.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async getVendor(id: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return vendor;
  }

  async createVendor(dto: CreateVendorDto, userId: string) {
    const existing = await this.prisma.vendor.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new BadRequestException("Vendor code already exists");
    }

    const vendor = await this.prisma.vendor.create({ data: dto });

    await this.auditService.create({
      action: "VENDOR_CREATE",
      userId,
      targetId: vendor.id,
      targetType: "VENDOR",
      metadata: { code: dto.code, name: dto.name },
    });

    return vendor;
  }

  async updateVendor(id: string, dto: UpdateVendorDto) {
    return this.prisma.vendor.update({
      where: { id },
      data: dto,
    });
  }

  // ==================== Purchase Requests ====================

  async getPurchaseRequests(query: QueryPRDto) {
    const { status, priority, requesterId, page = 1, limit = 20 } = query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (requesterId) where.requesterId = requesterId;

    const [data, total] = await Promise.all([
      this.prisma.purchaseRequest.findMany({
        where,
        include: {
          requester: {
            select: { id: true, name: true },
          },
          approver: {
            select: { id: true, name: true },
          },
          items: true,
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchaseRequest.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPurchaseRequest(id: string) {
    const pr = await this.prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        approver: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            inventoryItem: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        orders: true,
      },
    });

    if (!pr) {
      throw new NotFoundException("Purchase request not found");
    }

    return pr;
  }

  async getPendingRequests() {
    return this.getPurchaseRequests({ status: PurchaseRequestStatus.PENDING });
  }

  async createPurchaseRequest(dto: CreatePurchaseRequestDto, userId: string) {
    const requestNo = `PR-${Date.now().toString(36).toUpperCase()}`;

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + (item.estimatedPrice || 0) * item.quantity,
      0,
    );

    const pr = await this.prisma.purchaseRequest.create({
      data: {
        requestNo,
        title: dto.title,
        description: dto.description,
        requesterId: userId,
        priority: dto.priority || PurchasePriority.MEDIUM,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        notes: dto.notes,
        totalAmount,
        status: PurchaseRequestStatus.PENDING,
        items: {
          create: dto.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || "個",
            estimatedPrice: item.estimatedPrice,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Notify supervisors
    const supervisors = await this.prisma.user.findMany({
      where: { role: { in: [Role.SUPERVISOR, Role.ADMIN] }, isActive: true },
      select: { id: true },
    });

    for (const supervisor of supervisors) {
      await this.notificationsService.create({
        userId: supervisor.id,
        type: NotificationType.PR_PENDING_APPROVAL,
        title: "新採購申請",
        message: `新的採購申請：${dto.title}`,
        metadata: { requestId: pr.id },
      });
    }

    return pr;
  }

  async approvePurchaseRequest(
    id: string,
    dto: ApprovePRDto,
    user: { id: string; role: string },
  ) {
    if (![Role.SUPERVISOR, Role.ADMIN].includes(user.role as Role)) {
      throw new ForbiddenException("Only supervisors can approve requests");
    }

    const pr = await this.getPurchaseRequest(id);

    if (pr.status !== PurchaseRequestStatus.PENDING) {
      throw new BadRequestException("Request is not pending");
    }

    const approved = dto.approved === "true";

    const updated = await this.prisma.purchaseRequest.update({
      where: { id },
      data: {
        status: approved
          ? PurchaseRequestStatus.APPROVED
          : PurchaseRequestStatus.REJECTED,
        approverId: user.id,
        approvedAt: new Date(),
        rejectReason: dto.rejectReason,
      },
    });

    // Notify requester
    await this.notificationsService.create({
      userId: pr.requesterId,
      type: NotificationType.PR_APPROVED,
      title: approved ? "採購申請已核准" : "採購申請已駁回",
      message: approved
        ? `您的採購申請「${pr.title}」已被核准`
        : `您的採購申請「${pr.title}」已被駁回：${dto.rejectReason || "無說明"}`,
      metadata: { requestId: id },
    });

    return updated;
  }

  // ==================== Purchase Orders ====================

  async getPurchaseOrders(query: QueryPODto) {
    const { status, vendorId, page = 1, limit = 20 } = query;

    const where: any = {};
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;

    const [data, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          vendor: {
            select: { id: true, name: true, code: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPurchaseOrder(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        createdBy: {
          select: { id: true, name: true },
        },
        request: true,
        items: {
          include: {
            inventoryItem: {
              select: { id: true, name: true, sku: true },
            },
          },
        },
        receipts: {
          include: {
            receivedBy: {
              select: { id: true, name: true },
            },
            items: true,
          },
        },
      },
    });

    if (!po) {
      throw new NotFoundException("Purchase order not found");
    }

    return po;
  }

  async createPurchaseOrder(dto: CreatePurchaseOrderDto, userId: string) {
    const orderNo = `PO-${Date.now().toString(36).toUpperCase()}`;

    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const po = await this.prisma.purchaseOrder.create({
      data: {
        orderNo,
        requestId: dto.requestId,
        vendorId: dto.vendorId,
        createdById: userId,
        expectedDelivery: dto.expectedDelivery
          ? new Date(dto.expectedDelivery)
          : null,
        tax: dto.tax,
        shippingCost: dto.shippingCost,
        totalAmount,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            inventoryItemId: item.inventoryItemId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit || "個",
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
        vendor: {
          select: { id: true, name: true },
        },
      },
    });

    // Update PR status if linked
    if (dto.requestId) {
      await this.prisma.purchaseRequest.update({
        where: { id: dto.requestId },
        data: { status: PurchaseRequestStatus.ORDERED },
      });
    }

    await this.auditService.create({
      action: "PO_CREATE",
      userId,
      targetId: po.id,
      targetType: "PURCHASE_ORDER",
      metadata: { orderNo, vendorId: dto.vendorId },
    });

    return po;
  }

  // ==================== Goods Receipt ====================

  async createGoodsReceipt(dto: CreateGoodsReceiptDto, userId: string) {
    const order = await this.getPurchaseOrder(dto.orderId);
    const receiptNo = `GR-${Date.now().toString(36).toUpperCase()}`;

    const receipt = await this.prisma.goodsReceipt.create({
      data: {
        receiptNo,
        orderId: dto.orderId,
        receivedById: userId,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            orderItemId: item.orderItemId,
            receivedQty: item.receivedQty,
            acceptedQty: item.acceptedQty,
            rejectedQty: item.rejectedQty || 0,
            rejectReason: item.rejectReason,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update PO item received quantities
    for (const item of dto.items) {
      const orderItem = await this.prisma.purchaseOrderItem.findUnique({
        where: { id: item.orderItemId },
      });

      if (orderItem) {
        await this.prisma.purchaseOrderItem.update({
          where: { id: item.orderItemId },
          data: {
            receivedQty: orderItem.receivedQty + item.receivedQty,
          },
        });

        // Update inventory if linked
        if (orderItem.inventoryItemId && item.acceptedQty > 0) {
          await this.inventoryService.createTransaction(
            {
              itemId: orderItem.inventoryItemId,
              type: InventoryTxnType.IN,
              quantity: item.acceptedQty,
              note: `採購收貨: ${receiptNo}`,
            },
            userId,
          );
        }
      }
    }

    // Check if all items received
    const poItems = await this.prisma.purchaseOrderItem.findMany({
      where: { orderId: dto.orderId },
    });

    const allReceived = poItems.every((item) => item.receivedQty >= item.quantity);
    const someReceived = poItems.some((item) => item.receivedQty > 0);

    await this.prisma.purchaseOrder.update({
      where: { id: dto.orderId },
      data: {
        status: allReceived
          ? PurchaseOrderStatus.RECEIVED
          : someReceived
          ? PurchaseOrderStatus.PARTIAL_RECEIVED
          : order.status,
      },
    });

    return receipt;
  }

  // ==================== Stats ====================

  async getProcurementStats() {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [
      pendingRequests,
      approvedRequests,
      pendingOrders,
      pendingReceipts,
      monthlySpending,
    ] = await Promise.all([
      this.prisma.purchaseRequest.count({
        where: { status: PurchaseRequestStatus.PENDING },
      }),
      this.prisma.purchaseRequest.count({
        where: { status: PurchaseRequestStatus.APPROVED },
      }),
      this.prisma.purchaseOrder.count({
        where: {
          status: { in: [PurchaseOrderStatus.PENDING, PurchaseOrderStatus.SENT] },
        },
      }),
      this.prisma.purchaseOrder.count({
        where: {
          status: { in: [PurchaseOrderStatus.CONFIRMED, PurchaseOrderStatus.PARTIAL_RECEIVED] },
        },
      }),
      this.prisma.purchaseOrder.aggregate({
        where: {
          status: { in: [PurchaseOrderStatus.RECEIVED, PurchaseOrderStatus.COMPLETED] },
          createdAt: { gte: thisMonth },
        },
        _sum: { totalAmount: true },
      }),
    ]);

    return {
      pendingRequests,
      approvedRequests,
      pendingOrders,
      pendingReceipts,
      monthlySpending: monthlySpending._sum.totalAmount || 0,
    };
  }
}

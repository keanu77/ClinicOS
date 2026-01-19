import {
  PurchaseRequestStatus,
  PurchaseOrderStatus,
  PurchasePriority,
} from '../enums/procurement.enum';
import { UserWithoutPassword } from './user.types';

// Vendor
export interface Vendor {
  id: string;
  name: string;
  code: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxId?: string | null;
  bankAccount?: string | null;
  paymentTerms?: string | null;
  rating?: number | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVendorDto {
  name: string;
  code: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  bankAccount?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
}

export interface UpdateVendorDto {
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  bankAccount?: string;
  paymentTerms?: string;
  rating?: number;
  notes?: string;
  isActive?: boolean;
}

// Purchase Request
export interface PurchaseRequest {
  id: string;
  requestNo: string;
  title: string;
  description?: string | null;
  requesterId: string;
  requester?: UserWithoutPassword;
  status: PurchaseRequestStatus;
  priority: PurchasePriority;
  totalAmount?: number | null;
  approverId?: string | null;
  approver?: UserWithoutPassword | null;
  approvedAt?: Date | null;
  rejectReason?: string | null;
  notes?: string | null;
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items?: PurchaseRequestItem[];
}

export interface PurchaseRequestItem {
  id: string;
  requestId: string;
  inventoryItemId?: string | null;
  description: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number | null;
  notes?: string | null;
  createdAt: Date;
}

export interface CreatePurchaseRequestDto {
  title: string;
  description?: string;
  priority?: PurchasePriority;
  dueDate?: string;
  notes?: string;
  items: CreatePurchaseRequestItemDto[];
}

export interface CreatePurchaseRequestItemDto {
  inventoryItemId?: string;
  description: string;
  quantity: number;
  unit?: string;
  estimatedPrice?: number;
  notes?: string;
}

export interface ApprovePurchaseRequestDto {
  approved: boolean;
  rejectReason?: string;
}

export interface PRQueryDto {
  status?: PurchaseRequestStatus;
  priority?: PurchasePriority;
  requesterId?: string;
  page?: number;
  limit?: number;
}

// Purchase Order
export interface PurchaseOrder {
  id: string;
  orderNo: string;
  requestId?: string | null;
  request?: PurchaseRequest | null;
  vendorId: string;
  vendor?: Vendor;
  createdById: string;
  createdBy?: UserWithoutPassword;
  status: PurchaseOrderStatus;
  totalAmount?: number | null;
  tax?: number | null;
  shippingCost?: number | null;
  orderDate: Date;
  expectedDelivery?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  orderId: string;
  inventoryItemId?: string | null;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  receivedQty: number;
  notes?: string | null;
  createdAt: Date;
}

export interface CreatePurchaseOrderDto {
  requestId?: string;
  vendorId: string;
  expectedDelivery?: string;
  tax?: number;
  shippingCost?: number;
  notes?: string;
  items: CreatePurchaseOrderItemDto[];
}

export interface CreatePurchaseOrderItemDto {
  inventoryItemId?: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  notes?: string;
}

export interface POQueryDto {
  status?: PurchaseOrderStatus;
  vendorId?: string;
  page?: number;
  limit?: number;
}

// Goods Receipt
export interface GoodsReceipt {
  id: string;
  receiptNo: string;
  orderId: string;
  order?: PurchaseOrder;
  receivedById: string;
  receivedBy?: UserWithoutPassword;
  receivedAt: Date;
  notes?: string | null;
  createdAt: Date;
  items?: GoodsReceiptItem[];
}

export interface GoodsReceiptItem {
  id: string;
  receiptId: string;
  orderItemId: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  rejectReason?: string | null;
  notes?: string | null;
  createdAt: Date;
}

export interface CreateGoodsReceiptDto {
  orderId: string;
  notes?: string;
  items: CreateGoodsReceiptItemDto[];
}

export interface CreateGoodsReceiptItemDto {
  orderItemId: string;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty?: number;
  rejectReason?: string;
  notes?: string;
}

// Procurement Stats
export interface ProcurementStats {
  pendingRequests: number;
  approvedRequests: number;
  pendingOrders: number;
  pendingReceipts: number;
  monthlySpending: number;
}

import { InventoryTxnType } from '../enums/inventory.enum';
import { UserWithoutPassword } from './user.types';

export interface InventoryItem {
  id: string;
  name: string;
  category?: string;
  description?: string | null;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock?: number | null;
  location?: string | null;
  expiryDate?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  transactions?: InventoryTxn[];
}

export interface InventoryTxn {
  id: string;
  type: InventoryTxnType;
  quantity: number;
  note?: string | null;
  itemId: string;
  item?: InventoryItem;
  performedById: string;
  performedBy?: UserWithoutPassword;
  createdAt: Date;
}

export interface CreateInventoryItemDto {
  name: string;
  category?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  minStock?: number;
  maxStock?: number;
  location?: string;
  expiryDate?: string;
}

export interface UpdateInventoryItemDto {
  name?: string;
  description?: string;
  unit?: string;
  minStock?: number;
  maxStock?: number;
  location?: string;
  expiryDate?: string | null;
  isActive?: boolean;
}

export interface CreateInventoryTxnDto {
  itemId: string;
  type: InventoryTxnType;
  quantity: number;
  note?: string;
}

export interface InventoryQueryDto {
  search?: string;
  lowStock?: boolean;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface InventoryListResponse {
  data: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  shortage: number;
}

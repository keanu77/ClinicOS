import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import {
  PurchaseRequestStatus,
  PurchaseOrderStatus,
  PurchasePriority,
} from "../../shared";

// Vendor DTOs
export class CreateVendorDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateVendorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  taxId?: string;

  @IsString()
  @IsOptional()
  paymentTerms?: string;

  @IsNumber()
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

// Purchase Request DTOs
export class CreatePRItemDto {
  @IsString()
  @IsOptional()
  inventoryItemId?: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  estimatedPrice?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePurchaseRequestDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PurchasePriority)
  @IsOptional()
  priority?: PurchasePriority;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePRItemDto)
  items: CreatePRItemDto[];
}

export class ApprovePRDto {
  @IsString()
  approved: string; // 'true' or 'false'

  @IsString()
  @IsOptional()
  rejectReason?: string;
}

export class QueryPRDto {
  @IsEnum(PurchaseRequestStatus)
  @IsOptional()
  status?: PurchaseRequestStatus;

  @IsEnum(PurchasePriority)
  @IsOptional()
  priority?: PurchasePriority;

  @IsString()
  @IsOptional()
  requesterId?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;
}

// Purchase Order DTOs
export class CreatePOItemDto {
  @IsString()
  @IsOptional()
  inventoryItemId?: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  unitPrice: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePurchaseOrderDto {
  @IsString()
  @IsOptional()
  requestId?: string;

  @IsString()
  vendorId: string;

  @IsDateString()
  @IsOptional()
  expectedDelivery?: string;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsNumber()
  @IsOptional()
  shippingCost?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePOItemDto)
  items: CreatePOItemDto[];
}

export class QueryPODto {
  @IsEnum(PurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;
}

// Goods Receipt DTOs
export class CreateGRItemDto {
  @IsString()
  orderItemId: string;

  @IsNumber()
  receivedQty: number;

  @IsNumber()
  acceptedQty: number;

  @IsNumber()
  @IsOptional()
  rejectedQty?: number;

  @IsString()
  @IsOptional()
  rejectReason?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateGoodsReceiptDto {
  @IsString()
  orderId: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGRItemDto)
  items: CreateGRItemDto[];
}

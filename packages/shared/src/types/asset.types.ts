import {
  AssetStatus,
  AssetCondition,
  MaintenanceFrequency,
  MaintenanceType,
  FaultSeverity,
  FaultStatus,
} from '../enums/asset.enum';
import { UserWithoutPassword } from './user.types';

// Asset
export interface Asset {
  id: string;
  name: string;
  assetNo: string;
  category: string;
  model?: string | null;
  brand?: string | null;
  serialNo?: string | null;
  location?: string | null;
  department?: string | null;
  purchaseDate?: Date | null;
  purchaseCost?: number | null;
  warrantyStart?: Date | null;
  warrantyEnd?: Date | null;
  expectedLife?: number | null;
  status: AssetStatus;
  condition: AssetCondition;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  maintenanceSchedules?: MaintenanceSchedule[];
  faultReports?: FaultReport[];
}

export interface CreateAssetDto {
  name: string;
  assetNo: string;
  category: string;
  model?: string;
  brand?: string;
  serialNo?: string;
  location?: string;
  department?: string;
  purchaseDate?: string;
  purchaseCost?: number;
  warrantyStart?: string;
  warrantyEnd?: string;
  expectedLife?: number;
  condition?: AssetCondition;
  notes?: string;
}

export interface UpdateAssetDto {
  name?: string;
  category?: string;
  model?: string;
  brand?: string;
  serialNo?: string;
  location?: string;
  department?: string;
  purchaseDate?: string | null;
  purchaseCost?: number | null;
  warrantyStart?: string | null;
  warrantyEnd?: string | null;
  expectedLife?: number | null;
  status?: AssetStatus;
  condition?: AssetCondition;
  notes?: string;
}

export interface AssetQueryDto {
  category?: string;
  status?: AssetStatus;
  location?: string;
  department?: string;
  page?: number;
  limit?: number;
}

// Maintenance Schedule
export interface MaintenanceSchedule {
  id: string;
  assetId: string;
  asset?: Asset;
  name: string;
  description?: string | null;
  frequency: MaintenanceFrequency;
  frequencyDays: number;
  lastDoneAt?: Date | null;
  nextDueAt?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMaintenanceScheduleDto {
  assetId: string;
  name: string;
  description?: string;
  frequency: MaintenanceFrequency;
  frequencyDays: number;
  nextDueAt?: string;
}

export interface UpdateMaintenanceScheduleDto {
  name?: string;
  description?: string;
  frequency?: MaintenanceFrequency;
  frequencyDays?: number;
  isActive?: boolean;
}

// Maintenance Record
export interface MaintenanceRecord {
  id: string;
  assetId: string;
  asset?: Asset;
  scheduleId?: string | null;
  schedule?: MaintenanceSchedule | null;
  type: MaintenanceType;
  description?: string | null;
  cost?: number | null;
  performedAt: Date;
  performedById: string;
  performedBy?: UserWithoutPassword;
  notes?: string | null;
  createdAt: Date;
}

export interface CreateMaintenanceRecordDto {
  assetId: string;
  scheduleId?: string;
  type: MaintenanceType;
  description?: string;
  cost?: number;
  performedAt?: string;
  notes?: string;
}

// Fault Report
export interface FaultReport {
  id: string;
  assetId: string;
  asset?: Asset;
  reporterId: string;
  reporter?: UserWithoutPassword;
  title: string;
  description: string;
  severity: FaultSeverity;
  status: FaultStatus;
  resolverId?: string | null;
  resolver?: UserWithoutPassword | null;
  resolvedAt?: Date | null;
  resolution?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFaultReportDto {
  assetId: string;
  title: string;
  description: string;
  severity?: FaultSeverity;
}

export interface ResolveFaultDto {
  resolution: string;
}

export interface FaultQueryDto {
  assetId?: string;
  status?: FaultStatus;
  severity?: FaultSeverity;
  reporterId?: string;
  page?: number;
  limit?: number;
}

// Asset Usage Record
export interface AssetUsageRecord {
  id: string;
  assetId: string;
  asset?: Asset;
  userId: string;
  user?: UserWithoutPassword;
  startTime: Date;
  endTime?: Date | null;
  duration?: number | null;
  notes?: string | null;
  createdAt: Date;
}

// Asset Stats
export interface AssetStats {
  totalAssets: number;
  inUseAssets: number;
  maintenanceAssets: number;
  expiringWarranty: number;
  upcomingMaintenance: number;
  openFaults: number;
}

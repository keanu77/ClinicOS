import { CostType } from '../enums/finance.enum';
import { UserWithoutPassword } from './user.types';

// Cost Category
export interface CostCategory {
  id: string;
  name: string;
  type: CostType;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCostCategoryDto {
  name: string;
  type: CostType;
  description?: string;
}

export interface UpdateCostCategoryDto {
  name?: string;
  type?: CostType;
  description?: string;
  isActive?: boolean;
}

// Cost Entry
export interface CostEntry {
  id: string;
  categoryId: string;
  category?: CostCategory;
  description: string;
  amount: number;
  date: Date;
  reference?: string | null;
  notes?: string | null;
  createdById: string;
  createdBy?: UserWithoutPassword;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCostEntryDto {
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
}

export interface UpdateCostEntryDto {
  categoryId?: string;
  description?: string;
  amount?: number;
  date?: string;
  reference?: string;
  notes?: string;
}

export interface CostQueryDto {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Revenue Entry
export interface RevenueEntry {
  id: string;
  source: string;
  description: string;
  amount: number;
  date: Date;
  reference?: string | null;
  doctorId?: string | null;
  notes?: string | null;
  createdById: string;
  createdBy?: UserWithoutPassword;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRevenueEntryDto {
  source: string;
  description: string;
  amount: number;
  date: string;
  reference?: string;
  doctorId?: string;
  notes?: string;
}

export interface UpdateRevenueEntryDto {
  source?: string;
  description?: string;
  amount?: number;
  date?: string;
  reference?: string;
  doctorId?: string | null;
  notes?: string;
}

export interface RevenueQueryDto {
  source?: string;
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Cost Snapshot
export interface CostSnapshot {
  id: string;
  year: number;
  month: number;
  totalRevenue: number;
  totalCost: number;
  fixedCost: number;
  variableCost: number;
  grossMargin: number;
  marginRate: number;
  breakdown?: string | null;
  createdAt: Date;
}

// Finance Summary
export interface FinanceSummary {
  totalRevenue: number;
  totalCost: number;
  fixedCost: number;
  variableCost: number;
  grossMargin: number;
  marginRate: number;
}

// Category Breakdown
export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  type: CostType;
  amount: number;
  percentage: number;
}

// Doctor Revenue
export interface DoctorRevenue {
  doctorId: string;
  doctorName: string;
  totalRevenue: number;
  percentage: number;
}

// Monthly Comparison
export interface MonthlyComparison {
  month: string;
  revenue: number;
  cost: number;
  margin: number;
  revenueChange?: number;
  costChange?: number;
}

// Finance Dashboard Data
export interface FinanceDashboard {
  currentMonth: FinanceSummary;
  previousMonth: FinanceSummary;
  categoryBreakdown: CategoryBreakdown[];
  doctorRevenue: DoctorRevenue[];
  monthlyTrend: MonthlyComparison[];
}

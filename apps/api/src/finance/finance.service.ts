import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { CacheService } from "../common/cache/cache.service";
import { CACHE_KEYS, CACHE_TTL } from "../common/cache/cache.module";
import { CostType } from "../shared";
import {
  CreateCostCategoryDto,
  UpdateCostCategoryDto,
  CreateCostEntryDto,
  UpdateCostEntryDto,
  QueryCostEntryDto,
  CreateRevenueEntryDto,
  UpdateRevenueEntryDto,
  QueryRevenueEntryDto,
  ReportQueryDto,
  SnapshotQueryDto,
} from "./dto/finance.dto";

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private cacheService: CacheService,
  ) {}

  // ==================== Cost Categories ====================

  async getCostCategories() {
    return this.cacheService.wrap(
      CACHE_KEYS.COST_CATEGORIES,
      () =>
        this.prisma.costCategory.findMany({
          where: { isActive: true },
          orderBy: { name: "asc" },
        }),
      CACHE_TTL.LONG, // 1 hour cache
    );
  }

  async createCostCategory(dto: CreateCostCategoryDto, userId: string) {
    const category = await this.prisma.costCategory.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
      },
    });

    await this.auditService.create({
      action: "COST_CATEGORY_CREATE",
      userId,
      targetId: category.id,
      targetType: "COST_CATEGORY",
      metadata: { name: dto.name, type: dto.type },
    });

    return category;
  }

  async updateCostCategory(id: string, dto: UpdateCostCategoryDto) {
    return this.prisma.costCategory.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
      },
    });
  }

  // ==================== Cost Entries ====================

  async getCostEntries(query: QueryCostEntryDto) {
    const { categoryId, startDate, endDate, page = 1, limit = 20 } = query;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.costEntry.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, type: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.costEntry.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createCostEntry(dto: CreateCostEntryDto, userId: string) {
    const entry = await this.prisma.costEntry.create({
      data: {
        categoryId: dto.categoryId,
        amount: dto.amount,
        description: dto.description || "",
        date: new Date(dto.date),
        reference: dto.referenceId,
        createdById: userId,
      },
      include: {
        category: true,
      },
    });

    await this.auditService.create({
      action: "COST_ENTRY_CREATE",
      userId,
      targetId: entry.id,
      targetType: "COST_ENTRY",
      metadata: { amount: dto.amount, categoryId: dto.categoryId },
    });

    return entry;
  }

  async updateCostEntry(id: string, dto: UpdateCostEntryDto) {
    return this.prisma.costEntry.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        amount: dto.amount,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async deleteCostEntry(id: string, userId: string) {
    await this.prisma.costEntry.delete({
      where: { id },
    });

    await this.auditService.create({
      action: "COST_ENTRY_DELETE",
      userId,
      targetId: id,
      targetType: "COST_ENTRY",
    });

    return { success: true };
  }

  // ==================== Revenue Entries ====================

  async getRevenueEntries(query: QueryRevenueEntryDto) {
    const {
      source,
      doctorId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};
    if (source) where.source = source;
    if (doctorId) where.doctorId = doctorId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.revenueEntry.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.revenueEntry.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createRevenueEntry(dto: CreateRevenueEntryDto, userId: string) {
    const entry = await this.prisma.revenueEntry.create({
      data: {
        amount: dto.amount,
        source: dto.source || "其他",
        doctorId: dto.doctorId,
        description: dto.description || "",
        date: new Date(dto.date),
        createdById: userId,
      },
    });

    await this.auditService.create({
      action: "REVENUE_ENTRY_CREATE",
      userId,
      targetId: entry.id,
      targetType: "REVENUE_ENTRY",
      metadata: { amount: dto.amount, source: dto.source },
    });

    return entry;
  }

  async updateRevenueEntry(id: string, dto: UpdateRevenueEntryDto) {
    return this.prisma.revenueEntry.update({
      where: { id },
      data: {
        amount: dto.amount,
        source: dto.source,
        doctorId: dto.doctorId,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async deleteRevenueEntry(id: string, userId: string) {
    await this.prisma.revenueEntry.delete({
      where: { id },
    });

    await this.auditService.create({
      action: "REVENUE_ENTRY_DELETE",
      userId,
      targetId: id,
      targetType: "REVENUE_ENTRY",
    });

    return { success: true };
  }

  // ==================== Reports ====================

  async getSummary(query: ReportQueryDto) {
    const { startDate, endDate, year, month } = query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (year) {
      const start = new Date(year, month ? month - 1 : 0, 1);
      const end = month ? new Date(year, month, 0) : new Date(year, 11, 31);
      dateFilter = { gte: start, lte: end };
    } else {
      // Default: current month
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = { gte: start, lte: end };
    }

    const [totalCost, totalRevenue, fixedCosts, variableCosts] =
      await Promise.all([
        this.prisma.costEntry.aggregate({
          where: { date: dateFilter },
          _sum: { amount: true },
        }),
        this.prisma.revenueEntry.aggregate({
          where: { date: dateFilter },
          _sum: { amount: true },
        }),
        this.prisma.costEntry.aggregate({
          where: {
            date: dateFilter,
            category: { type: CostType.FIXED },
          },
          _sum: { amount: true },
        }),
        this.prisma.costEntry.aggregate({
          where: {
            date: dateFilter,
            category: { type: CostType.VARIABLE },
          },
          _sum: { amount: true },
        }),
      ]);

    const revenue = totalRevenue._sum?.amount || 0;
    const cost = totalCost._sum?.amount || 0;
    const fixed = fixedCosts._sum?.amount || 0;
    const variable = variableCosts._sum?.amount || 0;
    const grossProfit = revenue - cost;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    return {
      totalRevenue: revenue,
      totalCost: cost,
      fixedCosts: fixed,
      variableCosts: variable,
      grossProfit,
      grossMargin: Math.round(grossMargin * 100) / 100,
    };
  }

  async getBreakdown(query: ReportQueryDto) {
    const { startDate, endDate, year, month } = query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (year) {
      const start = new Date(year, month ? month - 1 : 0, 1);
      const end = month ? new Date(year, month, 0) : new Date(year, 11, 31);
      dateFilter = { gte: start, lte: end };
    } else {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = { gte: start, lte: end };
    }

    // Optimized: Single query with groupBy instead of N+1 loop queries
    const [categories, costsByCategory] = await Promise.all([
      this.prisma.costCategory.findMany({
        where: { isActive: true },
        select: { id: true, name: true, type: true },
      }),
      this.prisma.costEntry.groupBy({
        by: ["categoryId"],
        where: { date: dateFilter },
        _sum: { amount: true },
      }),
    ]);

    // Create a map for O(1) lookup
    const costMap = new Map(
      costsByCategory.map((c) => [c.categoryId, c._sum?.amount || 0]),
    );

    const breakdown = categories.map((category) => ({
      category: {
        id: category.id,
        name: category.name,
        type: category.type,
      },
      amount: costMap.get(category.id) || 0,
    }));

    return breakdown.sort((a, b) => b.amount - a.amount);
  }

  async getByDoctor(query: ReportQueryDto) {
    const { startDate, endDate, year, month } = query;

    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (year) {
      const start = new Date(year, month ? month - 1 : 0, 1);
      const end = month ? new Date(year, month, 0) : new Date(year, 11, 31);
      dateFilter = { gte: start, lte: end };
    } else {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = { gte: start, lte: end };
    }

    const revenues = await this.prisma.revenueEntry.groupBy({
      by: ["doctorId"],
      where: {
        date: dateFilter,
        doctorId: { not: null },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Optimized: Fetch all doctors in a single query instead of N queries
    const doctorIds = revenues
      .map((r) => r.doctorId)
      .filter((id): id is string => id !== null);

    const doctors = await this.prisma.user.findMany({
      where: { id: { in: doctorIds } },
      select: { id: true, name: true },
    });

    // Create a map for O(1) lookup
    const doctorMap = new Map(doctors.map((d) => [d.id, d]));

    const result = revenues
      .filter((item) => item.doctorId !== null)
      .map((item) => ({
        doctor: doctorMap.get(item.doctorId!) || null,
        revenue: item._sum?.amount || 0,
        transactionCount: item._count,
      }));

    return result.sort((a, b) => b.revenue - a.revenue);
  }

  async getMarginAnalysis(query: ReportQueryDto) {
    const { year } = query;
    const targetYear = year || new Date().getFullYear();

    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear, 11, 31, 23, 59, 59);

    // Optimized: Use raw SQL to get monthly aggregates in a single query
    // instead of 24 queries (12 months x 2 tables)
    const [revenueByMonth, costByMonth] = await Promise.all([
      this.prisma.$queryRaw<Array<{ month: number; total: number }>>`
        SELECT EXTRACT(MONTH FROM date)::integer as month,
               SUM(amount) as total
        FROM "RevenueEntry"
        WHERE date >= ${yearStart} AND date <= ${yearEnd}
        GROUP BY EXTRACT(MONTH FROM date)
      `,
      this.prisma.$queryRaw<Array<{ month: number; total: number }>>`
        SELECT EXTRACT(MONTH FROM date)::integer as month,
               SUM(amount) as total
        FROM "CostEntry"
        WHERE date >= ${yearStart} AND date <= ${yearEnd}
        GROUP BY EXTRACT(MONTH FROM date)
      `,
    ]);

    // Create maps for O(1) lookup
    const revenueMap = new Map(revenueByMonth.map((r) => [r.month, r.total]));
    const costMap = new Map(costByMonth.map((c) => [c.month, c.total]));

    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      const rev = revenueMap.get(month) || 0;
      const cos = costMap.get(month) || 0;
      const profit = rev - cos;
      const margin = rev > 0 ? (profit / rev) * 100 : 0;

      monthlyData.push({
        month,
        year: targetYear,
        revenue: rev,
        cost: cos,
        profit,
        margin: Math.round(margin * 100) / 100,
      });
    }

    return monthlyData;
  }

  // ==================== Snapshots ====================

  async createMonthlySnapshot(year: number, month: number, userId: string) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    const [totalRevenue, totalCost, fixedCosts, variableCosts] =
      await Promise.all([
        this.prisma.revenueEntry.aggregate({
          where: { date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
        this.prisma.costEntry.aggregate({
          where: { date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
        this.prisma.costEntry.aggregate({
          where: {
            date: { gte: start, lte: end },
            category: { type: CostType.FIXED },
          },
          _sum: { amount: true },
        }),
        this.prisma.costEntry.aggregate({
          where: {
            date: { gte: start, lte: end },
            category: { type: CostType.VARIABLE },
          },
          _sum: { amount: true },
        }),
      ]);

    const revenue = totalRevenue._sum?.amount || 0;
    const cost = totalCost._sum?.amount || 0;
    const fixed = fixedCosts._sum?.amount || 0;
    const variable = variableCosts._sum?.amount || 0;
    const grossMargin = revenue - cost;
    const marginRate = revenue > 0 ? (grossMargin / revenue) * 100 : 0;

    const snapshot = await this.prisma.costSnapshot.upsert({
      where: { year_month: { year, month } },
      update: {
        totalRevenue: revenue,
        totalCost: cost,
        fixedCost: fixed,
        variableCost: variable,
        grossMargin,
        marginRate: Math.round(marginRate * 100) / 100,
      },
      create: {
        year,
        month,
        totalRevenue: revenue,
        totalCost: cost,
        fixedCost: fixed,
        variableCost: variable,
        grossMargin,
        marginRate: Math.round(marginRate * 100) / 100,
      },
    });

    await this.auditService.create({
      action: "COST_SNAPSHOT_CREATE",
      userId,
      targetId: snapshot.id,
      targetType: "COST_SNAPSHOT",
      metadata: { year, month },
    });

    return snapshot;
  }

  async getSnapshots(query: SnapshotQueryDto) {
    const { year, month } = query;

    const where: any = { year };
    if (month) where.month = month;

    return this.prisma.costSnapshot.findMany({
      where,
      orderBy: { month: "asc" },
    });
  }
}

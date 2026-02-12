import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { ShiftType, NotificationType, NON_WORKING_SHIFT_CODES, ActivityTypeLabels, ActivityType, ShiftCode } from "../shared";
import { CreateShiftDto } from "./dto/create-shift.dto";
import { UpdateShiftDto } from "./dto/update-shift.dto";
import { QueryShiftDto } from "./dto/query-shift.dto";
import { QueryMonthlyDto } from "./dto/query-monthly.dto";
import { BulkUpsertScheduleDto } from "./dto/bulk-upsert-schedule.dto";
import { QueryMonthlyStatsDto } from "./dto/query-monthly-stats.dto";
import * as XLSX from "xlsx";

const ShiftTypeLabels: Record<string, string> = {
  [ShiftType.MORNING]: "早班",
  [ShiftType.AFTERNOON]: "午班",
  [ShiftType.NIGHT]: "晚班",
};

@Injectable()
export class SchedulingService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(query: QueryShiftDto) {
    const { start, end, userId, type } = query;

    const where: any = {};

    if (start) {
      where.date = { gte: new Date(start) };
    }
    if (end) {
      where.date = { ...where.date, lte: new Date(end) };
    }
    if (userId) where.userId = userId;
    if (type) where.type = type;

    return this.prisma.shift.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: [{ date: "asc" }, { type: "asc" }],
    });
  }

  async findById(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        handovers: {
          select: { id: true, title: true, status: true, priority: true },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException("Shift not found");
    }

    return shift;
  }

  async create(dto: CreateShiftDto) {
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    // Check if shift already exists
    const existing = await this.prisma.shift.findUnique({
      where: {
        date_type_userId: {
          date,
          type: dto.type,
          userId: dto.userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        "Shift already exists for this date, type, and user",
      );
    }

    const shift = await this.prisma.shift.create({
      data: {
        date,
        type: dto.type,
        userId: dto.userId,
        notes: dto.notes,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify the assigned user
    await this.notificationsService.create({
      userId: dto.userId,
      type: NotificationType.SHIFT_ASSIGNED,
      title: "新班次指派",
      message: `您已被安排於 ${date.toLocaleDateString("zh-TW")} ${ShiftTypeLabels[dto.type] || dto.type} 班`,
      metadata: { shiftId: shift.id },
    });

    return shift;
  }

  async update(id: string, dto: UpdateShiftDto) {
    const existingShift = await this.findById(id);

    const updateData: any = {};

    if (dto.date) {
      const date = new Date(dto.date);
      date.setHours(0, 0, 0, 0);
      updateData.date = date;
    }
    if (dto.type) updateData.type = dto.type;
    if (dto.userId) updateData.userId = dto.userId;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updatedShift = await this.prisma.shift.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify about shift change
    const notifyUserId = dto.userId || existingShift.userId;
    const shiftDate = dto.date ? new Date(dto.date) : existingShift.date;
    const shiftType = dto.type || existingShift.type;

    await this.notificationsService.create({
      userId: notifyUserId,
      type: NotificationType.SHIFT_CHANGED,
      title: "班次變更",
      message: `您的班次已更新：${shiftDate.toLocaleDateString("zh-TW")} ${ShiftTypeLabels[shiftType] || shiftType}`,
      metadata: { shiftId: id },
    });

    // If user changed, notify the old user too
    if (dto.userId && dto.userId !== existingShift.userId) {
      await this.notificationsService.create({
        userId: existingShift.userId,
        type: NotificationType.SHIFT_CHANGED,
        title: "班次變更",
        message: `您原本 ${existingShift.date.toLocaleDateString("zh-TW")} ${ShiftTypeLabels[existingShift.type] || existingShift.type} 的班次已被調整`,
        metadata: { shiftId: id },
      });
    }

    return updatedShift;
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.shift.delete({ where: { id } });
  }

  async getTodayShifts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.shift.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { type: "asc" },
    });
  }

  async getWeeklySchedule(startDate: Date) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const shifts = await this.prisma.shift.findMany({
      where: {
        date: {
          gte: start,
          lt: end,
        },
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: "asc" }, { type: "asc" }],
    });

    // Group by date
    const schedule: Record<string, any> = {};

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      schedule[dateStr] = {
        date: dateStr,
        shifts: {
          [ShiftType.MORNING]: [],
          [ShiftType.AFTERNOON]: [],
          [ShiftType.NIGHT]: [],
        },
      };
    }

    for (const shift of shifts) {
      const dateStr = shift.date.toISOString().split("T")[0];
      if (schedule[dateStr]) {
        schedule[dateStr].shifts[shift.type].push(shift);
      }
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      schedule: Object.values(schedule),
    };
  }

  async getUserShifts(userId: string, month?: string) {
    const where: any = { userId };

    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0);

      where.date = {
        gte: start,
        lte: end,
      };
    }

    return this.prisma.shift.findMany({
      where,
      orderBy: { date: "asc" },
    });
  }

  // ============================================
  // 月排班 (ScheduleEntry) 方法
  // ============================================

  async getMonthlySchedule(query: QueryMonthlyDto) {
    const year = parseInt(query.year, 10);
    const month = parseInt(query.month, 10);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const where: any = {
      date: { gte: start, lte: end },
    };
    if (query.department) {
      where.department = query.department;
    }

    const entries = await this.prisma.scheduleEntry.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, position: true },
        },
      },
      orderBy: [{ userId: "asc" }, { date: "asc" }],
    });

    return { year, month, entries };
  }

  async bulkUpsertSchedule(dto: BulkUpsertScheduleDto) {
    const results = [];

    for (const entry of dto.entries) {
      const date = new Date(entry.date);
      date.setHours(0, 0, 0, 0);

      const isNonWorking = NON_WORKING_SHIFT_CODES.includes(
        entry.shiftCode as ShiftCode,
      );

      const data = {
        date,
        department: entry.department,
        shiftCode: entry.shiftCode,
        periodA: isNonWorking ? null : (entry.periodA || null),
        periodB: isNonWorking ? null : (entry.periodB || null),
        periodC: isNonWorking ? null : (entry.periodC || null),
        notes: entry.notes || null,
        userId: entry.userId,
      };

      const result = await this.prisma.scheduleEntry.upsert({
        where: {
          date_userId: {
            date,
            userId: entry.userId,
          },
        },
        update: data,
        create: data,
      });

      results.push(result);
    }

    return { count: results.length, entries: results };
  }

  async deleteScheduleEntry(id: string) {
    const entry = await this.prisma.scheduleEntry.findUnique({
      where: { id },
    });
    if (!entry) {
      throw new NotFoundException("Schedule entry not found");
    }
    return this.prisma.scheduleEntry.delete({ where: { id } });
  }

  async getMonthlyStats(query: QueryMonthlyStatsDto) {
    const year = parseInt(query.year, 10);
    const month = parseInt(query.month, 10);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const where: any = {
      date: { gte: start, lte: end },
    };
    if (query.department) {
      where.department = query.department;
    }

    const entries = await this.prisma.scheduleEntry.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, position: true } },
      },
    });

    // Group by user
    const userMap: Record<string, {
      userId: string;
      userName: string;
      position: string;
      stats: Record<string, number>;
      workingDays: number;
      offDays: number;
      totalDays: number;
    }> = {};

    for (const entry of entries) {
      if (!userMap[entry.userId]) {
        userMap[entry.userId] = {
          userId: entry.userId,
          userName: entry.user.name,
          position: entry.user.position,
          stats: {},
          workingDays: 0,
          offDays: 0,
          totalDays: 0,
        };
      }

      const u = userMap[entry.userId];
      u.totalDays++;

      const isNonWorking = NON_WORKING_SHIFT_CODES.includes(
        entry.shiftCode as ShiftCode,
      );

      if (isNonWorking) {
        u.offDays++;
        // Count the shift code itself
        u.stats[entry.shiftCode] = (u.stats[entry.shiftCode] || 0) + 1;
      } else {
        u.workingDays++;
        // Count each period activity
        for (const period of [entry.periodA, entry.periodB, entry.periodC]) {
          if (period) {
            u.stats[period] = (u.stats[period] || 0) + 1;
          }
        }
      }
    }

    return {
      year,
      month,
      userStats: Object.values(userMap),
    };
  }

  async getDepartmentStaff(department?: string) {
    const where: any = { isActive: true };

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        position: true,
        role: true,
        employeeProfile: {
          select: { department: true },
        },
      },
      orderBy: { name: "asc" },
    });

    if (department) {
      // Filter by department mapping
      // SPORTS_MEDICINE: SPORTS_THERAPIST, certain roles
      // CLINIC: NURSE, DOCTOR, RECEPTIONIST, etc.
      return users.filter((u) => {
        if (department === "SPORTS_MEDICINE") {
          return (
            u.position === "SPORTS_THERAPIST" ||
            u.employeeProfile?.department === "運醫"
          );
        }
        if (department === "CLINIC") {
          return (
            u.position !== "SPORTS_THERAPIST" ||
            u.employeeProfile?.department === "診所"
          );
        }
        return true;
      });
    }

    // Group by department
    const sports = users.filter(
      (u) =>
        u.position === "SPORTS_THERAPIST" ||
        u.employeeProfile?.department === "運醫",
    );
    const clinic = users.filter(
      (u) =>
        u.position !== "SPORTS_THERAPIST" &&
        u.employeeProfile?.department !== "運醫",
    );

    return { SPORTS_MEDICINE: sports, CLINIC: clinic };
  }

  async importFromExcel(buffer: Buffer, department: string) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length < 2) {
      throw new BadRequestException("Excel 檔案格式不正確");
    }

    // Parse header row to find date columns
    const headerRow = data[0];
    const dateColumns: { col: number; day: number }[] = [];

    for (let c = 1; c < headerRow.length; c++) {
      const val = headerRow[c];
      if (val !== undefined && val !== null) {
        const dayNum = parseInt(String(val), 10);
        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
          dateColumns.push({ col: c, day: dayNum });
        }
      }
    }

    // Activity type reverse mapping (中文 → enum key)
    const activityReverseMap: Record<string, string> = {};
    for (const key of Object.keys(ActivityTypeLabels) as ActivityType[]) {
      activityReverseMap[ActivityTypeLabels[key]] = key;
    }

    // Shift code validation set
    const validShiftCodes = new Set(Object.values(ShiftCode));

    // Parse rows: expect groups of 4 rows per person (shiftCode, periodA, periodB, periodC)
    const entries: Array<{
      userName: string;
      date: string;
      shiftCode: string;
      periodA?: string;
      periodB?: string;
      periodC?: string;
    }> = [];

    let r = 1; // Start after header
    while (r < data.length) {
      const nameRow = data[r];
      if (!nameRow || !nameRow[0]) {
        r++;
        continue;
      }

      const userName = String(nameRow[0]).trim();
      if (!userName) {
        r++;
        continue;
      }

      // Row r: shift codes
      // Row r+1: period A
      // Row r+2: period B
      // Row r+3: period C
      const shiftRow = data[r] || [];
      const periodARow = data[r + 1] || [];
      const periodBRow = data[r + 2] || [];
      const periodCRow = data[r + 3] || [];

      for (const { col, day } of dateColumns) {
        const rawShiftCode = String(shiftRow[col] || "").trim().toUpperCase();
        if (!rawShiftCode || !validShiftCodes.has(rawShiftCode as ShiftCode)) {
          continue;
        }

        const rawA = String(periodARow[col] || "").trim();
        const rawB = String(periodBRow[col] || "").trim();
        const rawC = String(periodCRow[col] || "").trim();

        entries.push({
          userName,
          date: `${day}`, // Will be resolved with year/month later
          shiftCode: rawShiftCode,
          periodA: activityReverseMap[rawA] || undefined,
          periodB: activityReverseMap[rawB] || undefined,
          periodC: activityReverseMap[rawC] || undefined,
        });
      }

      r += 4;
    }

    return {
      department,
      parsedEntries: entries,
      totalEntries: entries.length,
      uniqueNames: [...new Set(entries.map((e) => e.userName))],
    };
  }

  async exportToExcel(year: number, month: number, department?: string) {
    const { entries } = await this.getMonthlySchedule({
      year: String(year),
      month: String(month),
      department,
    });

    const daysInMonth = new Date(year, month, 0).getDate();

    // Group entries by user
    const userEntries: Record<string, {
      userName: string;
      entries: Record<number, typeof entries[0]>;
    }> = {};

    for (const entry of entries) {
      if (!userEntries[entry.userId]) {
        userEntries[entry.userId] = {
          userName: entry.user.name,
          entries: {},
        };
      }
      const day = new Date(entry.date).getDate();
      userEntries[entry.userId].entries[day] = entry;
    }

    // Build worksheet data
    const wsData: any[][] = [];

    // Header: 人員 | 1 | 2 | ... | N
    const header = ["人員"];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const weekday = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
      header.push(`${d}(${weekday})`);
    }
    wsData.push(header);

    // For each user, 4 rows
    for (const ud of Object.values(userEntries)) {
      const shiftRow = [ud.userName];
      const aRow = ["  A上午"];
      const bRow = ["  B下午"];
      const cRow = ["  C晚上"];

      for (let d = 1; d <= daysInMonth; d++) {
        const e = ud.entries[d];
        if (e) {
          shiftRow.push(e.shiftCode);
          aRow.push(
            e.periodA
              ? (ActivityTypeLabels as Record<string, string>)[e.periodA] || e.periodA
              : "-",
          );
          bRow.push(
            e.periodB
              ? (ActivityTypeLabels as Record<string, string>)[e.periodB] || e.periodB
              : "-",
          );
          cRow.push(
            e.periodC
              ? (ActivityTypeLabels as Record<string, string>)[e.periodC] || e.periodC
              : "-",
          );
        } else {
          shiftRow.push("");
          aRow.push("");
          bRow.push("");
          cRow.push("");
        }
      }

      wsData.push(shiftRow, aRow, bRow, cRow);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws["!cols"] = [{ wch: 10 }];
    for (let d = 0; d < daysInMonth; d++) {
      ws["!cols"]!.push({ wch: 6 });
    }

    XLSX.utils.book_append_sheet(wb, ws, `${year}年${month}月排班`);

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }
}

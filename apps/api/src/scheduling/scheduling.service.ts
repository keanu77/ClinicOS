import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { ShiftType, NotificationType } from "../shared";
import { CreateShiftDto } from "./dto/create-shift.dto";
import { UpdateShiftDto } from "./dto/update-shift.dto";
import { QueryShiftDto } from "./dto/query-shift.dto";

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
}

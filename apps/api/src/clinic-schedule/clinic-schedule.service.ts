import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClinicSlotDto } from "./dto/create-clinic-slot.dto";
import { UpdateClinicSlotDto } from "./dto/update-clinic-slot.dto";
import { QueryClinicSlotDto } from "./dto/query-clinic-slot.dto";
import { CopyMonthDto } from "./dto/copy-month.dto";

@Injectable()
export class ClinicScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryClinicSlotDto) {
    const where: Record<string, unknown> = { isActive: true };

    if (query.clinicType) {
      where.clinicType = query.clinicType;
    }
    if (query.year) {
      where.year = parseInt(query.year, 10);
    }
    if (query.month) {
      where.month = parseInt(query.month, 10);
    }
    if (query.period) {
      where.period = query.period;
    }
    if (query.dayOfWeek) {
      where.dayOfWeek = parseInt(query.dayOfWeek, 10);
    }

    return this.prisma.clinicSlot.findMany({
      where,
      include: {
        doctor: {
          select: { id: true, name: true, position: true },
        },
      },
      orderBy: [
        { clinicType: "asc" },
        { dayOfWeek: "asc" },
        { period: "asc" },
        { sortOrder: "asc" },
      ],
    });
  }

  async findOne(id: string) {
    const slot = await this.prisma.clinicSlot.findUnique({
      where: { id },
      include: {
        doctor: {
          select: { id: true, name: true, position: true },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException(`Clinic slot ${id} not found`);
    }

    return slot;
  }

  async create(dto: CreateClinicSlotDto) {
    return this.prisma.clinicSlot.create({
      data: {
        clinicType: dto.clinicType,
        year: dto.year,
        month: dto.month,
        dayOfWeek: dto.dayOfWeek,
        period: dto.period,
        doctorName: dto.doctorName,
        doctorId: dto.doctorId || null,
        specialtyName: dto.specialtyName || null,
        startTime: dto.startTime || null,
        endTime: dto.endTime || null,
        registrationCutoff: dto.registrationCutoff || null,
        maxPatients: dto.maxPatients ?? null,
        clinicStartTime: dto.clinicStartTime || null,
        isAppointmentOnly: dto.isAppointmentOnly ?? false,
        specificDates: dto.specificDates || null,
        sortOrder: dto.sortOrder ?? 0,
        notes: dto.notes || null,
      },
      include: {
        doctor: {
          select: { id: true, name: true, position: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateClinicSlotDto) {
    await this.findOne(id);

    return this.prisma.clinicSlot.update({
      where: { id },
      data: dto,
      include: {
        doctor: {
          select: { id: true, name: true, position: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.clinicSlot.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async copyMonth(dto: CopyMonthDto) {
    // Check if target month already has data
    const existingCount = await this.prisma.clinicSlot.count({
      where: {
        year: dto.targetYear,
        month: dto.targetMonth,
        isActive: true,
      },
    });

    if (existingCount > 0) {
      throw new ConflictException(
        `目標月份 ${dto.targetYear}/${dto.targetMonth} 已有 ${existingCount} 筆門診資料`,
      );
    }

    // Fetch source month slots
    const sourceSlots = await this.prisma.clinicSlot.findMany({
      where: {
        year: dto.sourceYear,
        month: dto.sourceMonth,
        isActive: true,
      },
    });

    if (sourceSlots.length === 0) {
      throw new NotFoundException(
        `來源月份 ${dto.sourceYear}/${dto.sourceMonth} 無門診資料`,
      );
    }

    // Copy slots to target month (specificDates set to null)
    const created = await Promise.all(
      sourceSlots.map((slot) =>
        this.prisma.clinicSlot.create({
          data: {
            clinicType: slot.clinicType,
            year: dto.targetYear,
            month: dto.targetMonth,
            dayOfWeek: slot.dayOfWeek,
            period: slot.period,
            doctorName: slot.doctorName,
            doctorId: slot.doctorId,
            specialtyName: slot.specialtyName,
            startTime: slot.startTime,
            endTime: slot.endTime,
            registrationCutoff: slot.registrationCutoff,
            maxPatients: slot.maxPatients,
            clinicStartTime: slot.clinicStartTime,
            isAppointmentOnly: slot.isAppointmentOnly,
            specificDates: null,
            sortOrder: slot.sortOrder,
            notes: slot.notes,
          },
        }),
      ),
    );

    return { copied: created.length };
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClinicSlotDto } from "./dto/create-clinic-slot.dto";
import { UpdateClinicSlotDto } from "./dto/update-clinic-slot.dto";
import { QueryClinicSlotDto } from "./dto/query-clinic-slot.dto";

@Injectable()
export class ClinicScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryClinicSlotDto) {
    const where: Record<string, unknown> = { isActive: true };

    if (query.clinicType) {
      where.clinicType = query.clinicType;
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
}

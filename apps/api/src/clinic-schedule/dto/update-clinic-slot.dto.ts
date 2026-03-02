import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from "class-validator";
import { ClinicType, ClinicPeriod } from "../../shared";

export class UpdateClinicSlotDto {
  @IsOptional()
  @IsEnum(ClinicType)
  clinicType?: ClinicType;

  @IsOptional()
  @IsInt()
  year?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  dayOfWeek?: number;

  @IsOptional()
  @IsEnum(ClinicPeriod)
  period?: ClinicPeriod;

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  doctorId?: string | null;

  @IsOptional()
  @IsString()
  specialtyName?: string | null;

  @IsOptional()
  @IsString()
  startTime?: string | null;

  @IsOptional()
  @IsString()
  endTime?: string | null;

  @IsOptional()
  @IsString()
  registrationCutoff?: string | null;

  @IsOptional()
  @IsInt()
  maxPatients?: number | null;

  @IsOptional()
  @IsString()
  clinicStartTime?: string | null;

  @IsOptional()
  @IsBoolean()
  isAppointmentOnly?: boolean;

  @IsOptional()
  @IsString()
  specificDates?: string | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

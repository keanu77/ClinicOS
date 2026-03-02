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

export class CreateClinicSlotDto {
  @IsEnum(ClinicType)
  clinicType: ClinicType;

  @IsInt()
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(1)
  @Max(6)
  dayOfWeek: number;

  @IsEnum(ClinicPeriod)
  period: ClinicPeriod;

  @IsString()
  doctorName: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  specialtyName?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  registrationCutoff?: string;

  @IsOptional()
  @IsInt()
  maxPatients?: number;

  @IsOptional()
  @IsString()
  clinicStartTime?: string;

  @IsOptional()
  @IsBoolean()
  isAppointmentOnly?: boolean;

  @IsOptional()
  @IsString()
  specificDates?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

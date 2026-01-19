import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from "class-validator";
import { MaintenanceFrequency, MaintenanceType } from "../../shared";

export class CreateMaintenanceScheduleDto {
  @IsString()
  assetId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MaintenanceFrequency)
  frequency: MaintenanceFrequency;

  @IsNumber()
  frequencyDays: number;

  @IsDateString()
  @IsOptional()
  nextDueAt?: string;
}

export class UpdateMaintenanceScheduleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(MaintenanceFrequency)
  @IsOptional()
  frequency?: MaintenanceFrequency;

  @IsNumber()
  @IsOptional()
  frequencyDays?: number;
}

export class CreateMaintenanceRecordDto {
  @IsString()
  assetId: string;

  @IsString()
  @IsOptional()
  scheduleId?: string;

  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  cost?: number;

  @IsDateString()
  @IsOptional()
  performedAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

import {
  IsString,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
  IsNumber,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { LeaveType, LeaveStatus } from "../../shared";

export class CreateLeaveDto {
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  coverUserId?: string;
}

export class ApproveLeaveDto {
  @IsBoolean()
  approved: boolean;

  @IsString()
  @IsOptional()
  rejectReason?: string;
}

export class QueryLeaveDto {
  @IsString()
  @IsOptional()
  requesterId?: string;

  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus;

  @IsEnum(LeaveType)
  @IsOptional()
  leaveType?: LeaveType;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;
}

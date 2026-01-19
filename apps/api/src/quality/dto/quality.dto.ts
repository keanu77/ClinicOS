import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import {
  IncidentSeverity,
  IncidentStatus,
  ComplaintSource,
  ComplaintStatus,
} from "../../shared";

// Incident Type DTOs
export class CreateIncidentTypeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;
}

// Incident DTOs
export class CreateIncidentDto {
  @IsString()
  typeId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  occurredAt: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @IsBoolean()
  @IsOptional()
  isNearMiss?: boolean;
}

export class UpdateIncidentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @IsString()
  @IsOptional()
  handlerId?: string;

  @IsString()
  @IsOptional()
  rootCause?: string;

  @IsString()
  @IsOptional()
  correctiveAction?: string;

  @IsString()
  @IsOptional()
  preventiveAction?: string;
}

export class QueryIncidentDto {
  @IsString()
  @IsOptional()
  typeId?: string;

  @IsEnum(IncidentStatus)
  @IsOptional()
  status?: IncidentStatus;

  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "true")
  isNearMiss?: boolean;

  @IsString()
  @IsOptional()
  reporterId?: string;

  @IsString()
  @IsOptional()
  handlerId?: string;

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

export class CreateFollowUpDto {
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  actionTaken?: string;
}

// Complaint DTOs
export class CreateComplaintDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ComplaintSource)
  source: ComplaintSource;

  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;
}

export class UpdateComplaintDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ComplaintSource)
  @IsOptional()
  source?: ComplaintSource;

  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @IsString()
  @IsOptional()
  handlerId?: string;

  @IsString()
  @IsOptional()
  resolution?: string;
}

export class QueryComplaintDto {
  @IsEnum(ComplaintSource)
  @IsOptional()
  source?: ComplaintSource;

  @IsEnum(ComplaintStatus)
  @IsOptional()
  status?: ComplaintStatus;

  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @IsString()
  @IsOptional()
  handlerId?: string;

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

import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { CostType } from "../../shared";

// Cost Category DTOs
export class CreateCostCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CostType)
  type: CostType;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateCostCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CostType)
  @IsOptional()
  type?: CostType;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

// Cost Entry DTOs
export class CreateCostEntryDto {
  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  referenceType?: string; // PROCUREMENT, ASSET, SALARY, etc.

  @IsString()
  @IsOptional()
  referenceId?: string;
}

export class UpdateCostEntryDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}

export class QueryCostEntryDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

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

// Revenue Entry DTOs
export class CreateRevenueEntryDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  source?: string; // 掛號、自費項目等

  @IsString()
  @IsOptional()
  doctorId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;
}

export class UpdateRevenueEntryDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  doctorId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;
}

export class QueryRevenueEntryDto {
  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  doctorId?: string;

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

// Report Query DTOs
export class ReportQueryDto {
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
  year?: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  month?: number;
}

export class SnapshotQueryDto {
  @Type(() => Number)
  @IsNumber()
  year: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  month?: number;
}

import { IsString, IsOptional, IsEnum, IsNumber } from "class-validator";
import { Type, Transform } from "class-transformer";
import { FaultSeverity, FaultStatus } from "../../shared";

export class CreateFaultReportDto {
  @IsString()
  assetId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(FaultSeverity)
  @IsOptional()
  severity?: FaultSeverity;
}

export class ResolveFaultDto {
  @IsString()
  resolution: string;
}

export class QueryFaultDto {
  @IsString()
  @IsOptional()
  assetId?: string;

  @IsEnum(FaultStatus)
  @IsOptional()
  status?: FaultStatus;

  @IsEnum(FaultSeverity)
  @IsOptional()
  severity?: FaultSeverity;

  @IsString()
  @IsOptional()
  reporterId?: string;

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

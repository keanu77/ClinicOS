import { IsOptional, IsString, IsEnum, IsDateString } from "class-validator";
import { ShiftType } from "../../shared";

export class QueryShiftDto {
  @IsOptional()
  @IsDateString()
  start?: string;

  @IsOptional()
  @IsDateString()
  end?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(ShiftType)
  type?: ShiftType;
}

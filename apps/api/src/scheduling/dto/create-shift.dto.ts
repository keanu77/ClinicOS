import { IsString, IsEnum, IsOptional, IsDateString } from "class-validator";
import { ShiftType } from "../../shared";

export class CreateShiftDto {
  @IsDateString()
  date: string;

  @IsEnum(ShiftType)
  type: ShiftType;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

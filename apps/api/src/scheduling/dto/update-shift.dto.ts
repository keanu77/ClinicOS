import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ShiftType } from '../../shared';

export class UpdateShiftDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(ShiftType)
  type?: ShiftType;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

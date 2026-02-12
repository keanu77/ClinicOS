import { IsArray, IsString, IsOptional, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ScheduleEntryDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsDateString()
  date: string;

  @IsString()
  department: string;

  @IsString()
  shiftCode: string;

  @IsOptional()
  @IsString()
  periodA?: string;

  @IsOptional()
  @IsString()
  periodB?: string;

  @IsOptional()
  @IsString()
  periodC?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  userId: string;
}

export class BulkUpsertScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleEntryDto)
  entries: ScheduleEntryDto[];
}

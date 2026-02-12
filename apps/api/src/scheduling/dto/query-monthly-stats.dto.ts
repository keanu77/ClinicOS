import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryMonthlyStatsDto {
  @IsNumberString()
  year: string;

  @IsNumberString()
  month: string;

  @IsOptional()
  @IsString()
  department?: string;
}

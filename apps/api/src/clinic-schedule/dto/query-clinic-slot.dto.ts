import { IsOptional, IsString, IsEnum } from "class-validator";
import { ClinicType } from "../../shared";

export class QueryClinicSlotDto {
  @IsOptional()
  @IsEnum(ClinicType)
  clinicType?: ClinicType;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsString()
  dayOfWeek?: string;
}

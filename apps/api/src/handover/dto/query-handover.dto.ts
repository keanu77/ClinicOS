import { IsEnum, IsOptional, IsString, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { HandoverStatus, HandoverPriority } from "../../shared";

export class QueryHandoverDto {
  @IsOptional()
  @IsEnum(HandoverStatus)
  status?: HandoverStatus;

  @IsOptional()
  @IsEnum(HandoverPriority)
  priority?: HandoverPriority;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  createdById?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

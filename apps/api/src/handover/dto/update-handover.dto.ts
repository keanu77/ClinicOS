import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
  IsNumber,
} from "class-validator";
import { HandoverStatus, HandoverPriority } from "../../shared";

export class UpdateHandoverDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;

  @IsOptional()
  @IsEnum(HandoverStatus)
  status?: HandoverStatus;

  @IsOptional()
  @IsEnum(HandoverPriority)
  priority?: HandoverPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  // Enhanced Task Fields
  @IsOptional()
  @IsNumber()
  estimatedHours?: number | null;

  @IsOptional()
  @IsNumber()
  actualHours?: number | null;

  @IsOptional()
  @IsString()
  blockedReason?: string | null;

  @IsOptional()
  @IsString()
  parentId?: string | null;
}

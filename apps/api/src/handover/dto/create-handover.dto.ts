import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
  IsNumber,
  IsArray,
} from "class-validator";
import { HandoverPriority } from "../../shared";

export class CreateHandoverDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsOptional()
  @IsEnum(HandoverPriority)
  priority?: HandoverPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  // Enhanced Task Fields
  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
}

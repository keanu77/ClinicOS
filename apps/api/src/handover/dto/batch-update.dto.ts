import {
  IsArray,
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { HandoverStatus, HandoverPriority } from "../../shared";

export class BatchUpdateItemDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsEnum(HandoverStatus)
  status?: HandoverStatus;

  @IsOptional()
  @IsEnum(HandoverPriority)
  priority?: HandoverPriority;

  @IsOptional()
  @IsString()
  assigneeId?: string | null;
}

export class BatchUpdateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchUpdateItemDto)
  @ArrayMinSize(1)
  items: BatchUpdateItemDto[];
}

import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsArray,
} from "class-validator";
import { TaskCollaboratorRole } from "../../shared";

// Category DTOs
export class SetCategoriesDto {
  @IsArray()
  @IsString({ each: true })
  categoryIds: string[];
}

// Collaborator DTOs
export class AddCollaboratorDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(TaskCollaboratorRole)
  role?: TaskCollaboratorRole;
}

// Checklist DTOs
export class CreateChecklistDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateChecklistDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// SubTask DTO
export class CreateSubTaskDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}

import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsArray,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { DocumentStatus, AnnouncementPriority } from "../../shared";

// Document Category DTOs
export class CreateDocumentCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

// Document DTOs
export class CreateDocumentDto {
  @IsString()
  docNo: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  reviewDate?: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @IsDateString()
  @IsOptional()
  reviewDate?: string;
}

export class PublishDocumentDto {
  @IsString()
  @IsOptional()
  changeNotes?: string;
}

export class QueryDocumentDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsEnum(DocumentStatus)
  @IsOptional()
  status?: DocumentStatus;

  @IsString()
  @IsOptional()
  search?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;
}

// Announcement DTOs
export class CreateAnnouncementDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsDateString()
  @IsOptional()
  publishAt?: string;

  @IsDateString()
  @IsOptional()
  expireAt?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetRoles?: string[];
}

export class UpdateAnnouncementDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;

  @IsDateString()
  @IsOptional()
  publishAt?: string;

  @IsDateString()
  @IsOptional()
  expireAt?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetRoles?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QueryAnnouncementDto {
  @IsEnum(AnnouncementPriority)
  @IsOptional()
  priority?: AnnouncementPriority;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "true")
  isPinned?: boolean;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 20;
}

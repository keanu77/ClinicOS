import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  MinLength,
} from "class-validator";
import { Permission, PermissionRequestStatus, Position } from "../../shared";

export class CreatePermissionRequestDto {
  @IsEnum(Permission)
  permission: Permission;

  @IsString()
  @MinLength(10, { message: "Reason must be at least 10 characters" })
  reason: string;
}

export class ReviewPermissionRequestDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}

export class GrantPermissionDto {
  @IsEnum(Permission)
  permission: Permission;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class RevokePermissionDto {
  @IsEnum(Permission)
  permission: Permission;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateUserPositionDto {
  @IsEnum(Position)
  position: Position;
}

export class PermissionRequestQueryDto {
  @IsOptional()
  @IsEnum(PermissionRequestStatus)
  status?: PermissionRequestStatus;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

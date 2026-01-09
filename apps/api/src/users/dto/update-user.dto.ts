import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { Role } from '@clinic-os/shared';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

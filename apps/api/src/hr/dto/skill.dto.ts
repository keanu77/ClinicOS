import { IsString, IsOptional, IsEnum, IsDateString } from "class-validator";
import { SkillLevel } from "../../shared";

export class CreateSkillDefinitionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;
}

export class AssignSkillDto {
  @IsString()
  userId: string;

  @IsString()
  skillId: string;

  @IsEnum(SkillLevel)
  @IsOptional()
  level?: SkillLevel;

  @IsDateString()
  @IsOptional()
  certifiedAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateEmployeeSkillDto {
  @IsEnum(SkillLevel)
  @IsOptional()
  level?: SkillLevel;

  @IsDateString()
  @IsOptional()
  certifiedAt?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

import { IsString, IsOptional, IsDateString, IsEnum } from "class-validator";
import { CertificationStatus } from "../../shared";

export class CreateCertificationDto {
  @IsString()
  userId: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  issuingOrg?: string;

  @IsString()
  @IsOptional()
  certNo?: string;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateCertificationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  issuingOrg?: string;

  @IsString()
  @IsOptional()
  certNo?: string;

  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @IsEnum(CertificationStatus)
  @IsOptional()
  status?: CertificationStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

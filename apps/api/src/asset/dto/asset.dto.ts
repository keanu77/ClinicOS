import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { AssetStatus, AssetCondition } from "../../shared";

export class CreateAssetDto {
  @IsString()
  name: string;

  @IsString()
  assetNo: string;

  @IsString()
  category: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  serialNo?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsNumber()
  @IsOptional()
  purchaseCost?: number;

  @IsDateString()
  @IsOptional()
  warrantyStart?: string;

  @IsDateString()
  @IsOptional()
  warrantyEnd?: string;

  @IsNumber()
  @IsOptional()
  expectedLife?: number;

  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAssetDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  serialNo?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @IsNumber()
  @IsOptional()
  purchaseCost?: number;

  @IsDateString()
  @IsOptional()
  warrantyStart?: string;

  @IsDateString()
  @IsOptional()
  warrantyEnd?: string;

  @IsNumber()
  @IsOptional()
  expectedLife?: number;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @IsEnum(AssetCondition)
  @IsOptional()
  condition?: AssetCondition;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class QueryAssetDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(AssetStatus)
  @IsOptional()
  status?: AssetStatus;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  department?: string;

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

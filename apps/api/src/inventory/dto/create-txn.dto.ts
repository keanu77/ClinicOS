import { IsString, IsEnum, IsInt, IsOptional } from 'class-validator';
import { InventoryTxnType } from '@clinic-os/shared';

export class CreateTxnDto {
  @IsString()
  itemId: string;

  @IsEnum(InventoryTxnType)
  type: InventoryTxnType;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  note?: string;
}

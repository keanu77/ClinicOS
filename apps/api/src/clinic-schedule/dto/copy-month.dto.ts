import { IsInt, Min, Max } from "class-validator";

export class CopyMonthDto {
  @IsInt()
  sourceYear: number;

  @IsInt()
  @Min(1)
  @Max(12)
  sourceMonth: number;

  @IsInt()
  targetYear: number;

  @IsInt()
  @Min(1)
  @Max(12)
  targetMonth: number;
}

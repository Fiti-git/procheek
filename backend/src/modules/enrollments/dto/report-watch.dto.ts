import { IsInt, IsOptional, Min } from 'class-validator';

export class ReportWatchDto {
  @IsInt() @Min(0)
  positionSec!: number;

  @IsOptional() @IsInt() @Min(0)
  durationSec?: number;
}

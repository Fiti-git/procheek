import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsInt() @Min(0) @Max(100)
  progressPct!: number;

  @IsOptional()
  markCompleted?: boolean;
}

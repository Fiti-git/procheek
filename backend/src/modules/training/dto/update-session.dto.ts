import { IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSessionDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsDateString()
  scheduledAt?: string;

  @IsOptional() @IsDateString()
  deliveredAt?: string;

  @IsOptional() @IsNumber() @Min(0)
  durationHours?: number;

  @IsOptional() @IsInt() @Min(0)
  attendeeCount?: number;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsIn(['scheduled', 'delivered', 'canceled'])
  status?: 'scheduled' | 'delivered' | 'canceled';

  @IsOptional() @IsString()
  notes?: string;
}

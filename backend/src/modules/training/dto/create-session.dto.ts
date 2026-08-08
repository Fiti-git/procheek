import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateSessionDto {
  @IsOptional() @IsUUID()
  capacitadorId?: string;

  @IsOptional() @IsUUID()
  clientCompanyId?: string;

  @IsOptional() @IsUUID()
  courseId?: string;

  @IsString()
  title!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional() @IsNumber() @Min(0)
  durationHours?: number;

  @IsOptional() @IsInt() @Min(0)
  attendeeCount?: number;

  @IsOptional() @IsString()
  location?: string;

  @IsOptional() @IsString()
  notes?: string;
}

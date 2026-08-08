import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTrainerProfileDto {
  @IsOptional() @IsString()
  stpsRegistration?: string;

  @IsOptional() @IsString()
  rfc?: string;

  @IsOptional() @IsNumber() @Min(0)
  hourlyRate?: number;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsArray()
  specialties?: string[];

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

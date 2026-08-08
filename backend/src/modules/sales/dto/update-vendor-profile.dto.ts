import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class UpdateVendorProfileDto {
  @IsOptional() @IsString()
  employeeId?: string;

  @IsOptional() @IsString()
  hireDate?: string;

  @IsOptional() @IsNumber() @Min(0)
  quotaMonthly?: number;

  @IsOptional() @IsObject()
  commissionRule?: Record<string, any>;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsArray()
  specialties?: string[];

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

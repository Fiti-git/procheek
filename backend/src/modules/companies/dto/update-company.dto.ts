import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class UpdateCompanyDto {
  @IsOptional() @IsString() @Length(2, 200)
  legalName?: string;

  @IsOptional() @IsString() @Length(12, 13)
  rfc?: string;

  @IsOptional() @IsEmail()
  contactEmail?: string;

  @IsOptional() @IsString()
  contactPhone?: string;

  @IsOptional() @IsString()
  address?: string;

  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  state?: string;

  @IsOptional() @IsString()
  zip?: string;

  @IsOptional() @IsString()
  industry?: string;

  @IsOptional() @IsEnum(['active', 'suspended'])
  status?: 'active' | 'suspended';
}

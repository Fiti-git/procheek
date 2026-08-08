import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @Length(2, 200)
  legalName!: string;

  @IsEnum(['client', 'subcontractor'])
  type!: 'client' | 'subcontractor';

  @IsOptional() @IsUUID()
  parentCompanyId?: string;

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
}

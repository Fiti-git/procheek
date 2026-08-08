import { IsIn, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateLeadDto {
  @IsOptional() @IsString()
  companyName?: string;

  @IsOptional() @IsString()
  contactName?: string;

  @IsOptional() @IsString()
  contactEmail?: string;

  @IsOptional() @IsString()
  contactPhone?: string;

  @IsOptional() @IsString()
  industry?: string;

  @IsOptional() @IsNumber() @Min(0)
  expectedAmount?: number;

  @IsOptional()
  @IsIn(['nuevo', 'contactado', 'propuesta', 'cerrado_ganado', 'cerrado_perdido'])
  status?: string;

  @IsOptional() @IsString()
  notes?: string;
}

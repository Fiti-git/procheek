import { IsEmail, IsIn, IsOptional, IsString, IsUUID, IsNumber, Min, Length } from 'class-validator';

export class CreateLeadDto {
  @IsOptional() @IsUUID()
  vendedorId?: string;

  @IsString() @Length(1, 200)
  companyName!: string;

  @IsString() @Length(1, 200)
  contactName!: string;

  @IsOptional() @IsEmail()
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

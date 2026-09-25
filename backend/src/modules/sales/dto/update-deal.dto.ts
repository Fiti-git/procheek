import { IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateDealDto {
  @IsOptional() @IsUUID()
  leadId?: string;

  @IsOptional() @IsUUID()
  buyerCompanyId?: string;

  @IsOptional() @IsString()
  buyerName?: string;

  @IsOptional() @IsIn(['basico', 'plus', 'enterprise', 'custom'])
  package?: 'basico' | 'plus' | 'enterprise' | 'custom';

  @IsOptional() @IsNumber() @Min(0)
  amount?: number;
}

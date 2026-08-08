import { IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateDealDto {
  @IsOptional() @IsUUID()
  vendedorId?: string;

  @IsOptional() @IsUUID()
  leadId?: string;

  @IsOptional() @IsUUID()
  buyerCompanyId?: string;

  @IsString()
  buyerName!: string;

  @IsIn(['basico', 'plus', 'enterprise', 'custom'])
  package!: 'basico' | 'plus' | 'enterprise' | 'custom';

  @IsNumber() @Min(0)
  amount!: number;
}

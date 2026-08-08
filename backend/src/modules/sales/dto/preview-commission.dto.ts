import { IsIn, IsNumber, IsObject, IsOptional, Min } from 'class-validator';

export class PreviewCommissionDto {
  @IsObject()
  rule!: Record<string, any>;

  @IsNumber() @Min(0)
  amount!: number;

  @IsOptional() @IsIn(['basico', 'plus', 'enterprise', 'custom'])
  package?: 'basico' | 'plus' | 'enterprise' | 'custom';
}

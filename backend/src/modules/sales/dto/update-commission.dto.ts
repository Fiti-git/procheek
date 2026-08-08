import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateCommissionDto {
  @IsIn(['pending', 'approved', 'paid', 'void'])
  status!: 'pending' | 'approved' | 'paid' | 'void';

  @IsOptional() @IsString()
  notes?: string;
}

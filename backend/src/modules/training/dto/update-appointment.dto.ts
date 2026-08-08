import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAppointmentDto {
  @IsOptional()
  @IsIn(['requested', 'confirmed', 'completed', 'canceled', 'no_show'])
  status?: 'requested' | 'confirmed' | 'completed' | 'canceled' | 'no_show';

  @IsOptional() @IsString()
  notes?: string;
}

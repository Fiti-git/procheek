import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsIn(['public', 'client_admin', 'client', 'subcontractor'])
  requester_kind!: 'public' | 'client_admin' | 'client' | 'subcontractor';

  @IsEmail()
  requester_email!: string;

  @IsString()
  requester_contact_name!: string;

  @IsOptional() @IsString()
  requester_company_name?: string;

  @IsOptional() @IsString()
  requester_phone?: string;

  @IsIn(['demo', 'consulting', 'training', 'follow_up'])
  purpose!: 'demo' | 'consulting' | 'training' | 'follow_up';

  @IsDateString()
  scheduled_at!: string;

  @IsUUID()
  assigned_user_id!: string;

  @IsOptional() @IsInt() @Min(15)
  duration_min?: number;

  @IsOptional() @IsString()
  notes?: string;
}

import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateTicketDto {
  @IsString() @Length(2, 200)
  subject!: string;

  @IsString() @Length(10, 5000)
  body!: string;
}

export class UpdateTicketDto {
  @IsOptional() @IsEnum(['open', 'in_progress', 'resolved', 'closed'])
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
}

import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class AdminIssueCertDto {
  @IsOptional() @IsUUID()
  enrollmentId?: string;

  @IsOptional() @IsUUID()
  userId?: string;

  @IsOptional() @IsUUID()
  courseId?: string;

  @IsOptional() @IsString() @Length(1, 100)
  dc3Folio?: string;

  @IsOptional() @IsDateString()
  expiresAt?: string;
}

export class RevokeCertDto {
  @IsOptional() @IsString() @Length(1, 500)
  reason?: string;
}

import { IsDateString, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class AdminIssueCertDto {
  @Transform(({ value, obj }) => value ?? obj?.enrollment_id)
  @IsOptional() @IsUUID()
  enrollmentId?: string;

  // Accept snake_case aliases so admin issue for another user cannot silently
  // fall through and mis-assign the certificate.
  @Transform(({ value, obj }) => value ?? obj?.user_id)
  @IsOptional() @IsUUID()
  userId?: string;

  @Transform(({ value, obj }) => value ?? obj?.course_id)
  @IsOptional() @IsUUID()
  courseId?: string;

  @Transform(({ value, obj }) => value ?? obj?.dc3_folio)
  @IsOptional() @IsString() @Length(1, 100)
  dc3Folio?: string;

  @Transform(({ value, obj }) => value ?? obj?.expires_at)
  @IsOptional() @IsDateString()
  expiresAt?: string;
}

export class RevokeCertDto {
  @IsOptional() @IsString() @Length(1, 500)
  reason?: string;
}

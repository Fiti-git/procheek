import { IsOptional, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID()
  courseId!: string;

  // Optional: enroll another user (admin-assign flow). If omitted, self-enroll.
  @IsOptional() @IsUUID()
  userId?: string;
}

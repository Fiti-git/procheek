import { IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEnrollmentDto {
  @Transform(({ value, obj }) => value ?? obj?.course_id)
  @IsUUID()
  courseId!: string;

  // Optional: enroll another user (admin-assign flow). If omitted, self-enroll.
  // Accepts either `userId` or the snake_case `user_id` variant so callers
  // using the SQL-style naming don't silently self-enroll.
  @Transform(({ value, obj }) => value ?? obj?.user_id)
  @IsOptional() @IsUUID()
  userId?: string;
}

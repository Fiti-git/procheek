import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class BulkAssignDto {
  @IsUUID()
  courseId!: string;

  @IsArray() @ArrayMinSize(1) @IsUUID('4', { each: true })
  userIds!: string[];
}

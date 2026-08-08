import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, IsUUID, Length, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionDto {
  @IsOptional() @IsString()
  id?: string;

  @IsString() @Length(4, 500)
  prompt!: string;

  @IsArray() @ArrayMinSize(2) @IsString({ each: true })
  choices!: string[];

  @IsInt() @Min(0)
  correctIndex!: number;
}

export class UpsertQuizDto {
  @IsUUID()
  courseId!: string;

  @IsString() @Length(2, 200)
  titleEs!: string;

  @IsOptional() @IsString() @Length(2, 200)
  titleEn?: string;

  @IsInt() @Min(1) @Max(100)
  passingScore!: number;

  @IsInt() @Min(1) @Max(20)
  maxAttempts!: number;

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => QuestionDto)
  questions!: QuestionDto[];
}

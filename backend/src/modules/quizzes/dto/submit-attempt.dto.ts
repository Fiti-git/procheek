import { ArrayMinSize, IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsString()
  questionId!: string;

  @IsInt() @Min(0)
  choiceIndex!: number;
}

export class SubmitAttemptDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => AnswerDto)
  answers!: AnswerDto[];
}

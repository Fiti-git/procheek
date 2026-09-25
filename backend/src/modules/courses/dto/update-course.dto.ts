import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { COURSE_INDUSTRIES, COURSE_TIERS } from './create-course.dto';

export class UpdateCourseDto {
  @IsOptional() @IsString() @Length(2, 100)
  code?: string;

  @IsOptional() @IsString() @Length(2, 200)
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsNumber() @Min(0)
  hours?: number;

  @IsOptional() @IsNumber() @Min(0)
  price?: number;

  @IsOptional() @IsIn(COURSE_INDUSTRIES as unknown as string[])
  industry?: string;

  @IsOptional() @IsIn(COURSE_TIERS as unknown as string[])
  tier?: string;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  // Legacy fields.
  @IsOptional() @IsString() @Length(2, 200)
  titleEs?: string;

  @IsOptional() @IsString() @Length(2, 200)
  titleEn?: string;

  @IsOptional() @IsString()
  descriptionEs?: string;

  @IsOptional() @IsString()
  descriptionEn?: string;

  @IsOptional() @IsString()
  nomReference?: string;

  @IsOptional() @IsNumber() @Min(0)
  priceMxn?: number;

  @IsOptional() @IsNumber() @Min(0)
  durationHours?: number;

  @IsOptional() @IsBoolean()
  isPublished?: boolean;

  @IsOptional() @IsNumber() @Min(0)
  validityMonths?: number;
}

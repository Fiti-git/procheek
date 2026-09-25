import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';

export const COURSE_INDUSTRIES = [
  'quimica',
  'metalmecanica',
  'mineria',
  'construccion',
  'general',
] as const;
export type CourseIndustry = (typeof COURSE_INDUSTRIES)[number];

export const COURSE_TIERS = ['basico', 'complementario'] as const;
export type CourseTier = (typeof COURSE_TIERS)[number];

export class CreateCourseDto {
  // Public course code (e.g. "NOM-009"). Also becomes the slug when not provided.
  @IsString() @Length(2, 100)
  code!: string;

  @IsString() @Length(2, 200)
  title!: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsNumber() @Min(0)
  hours?: number;

  @IsOptional() @IsNumber() @Min(0)
  price?: number;

  @IsIn(COURSE_INDUSTRIES as unknown as string[])
  industry!: CourseIndustry;

  @IsIn(COURSE_TIERS as unknown as string[])
  tier!: CourseTier;

  @IsOptional() @IsString()
  imageUrl?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  // Legacy fields — optional, still accepted.
  @IsOptional() @IsString() @Matches(/^[a-z0-9-]+$/) @Length(2, 100)
  slug?: string;

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

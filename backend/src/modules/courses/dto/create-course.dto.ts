import { IsBoolean, IsNumber, IsOptional, IsString, Length, Matches, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString() @Matches(/^[a-z0-9-]+$/) @Length(2, 100)
  slug!: string;

  @IsString() @Length(2, 200)
  titleEs!: string;

  @IsOptional() @IsString() @Length(2, 200)
  titleEn?: string;

  @IsOptional() @IsString()
  descriptionEs?: string;

  @IsOptional() @IsString()
  descriptionEn?: string;

  @IsOptional() @IsString()
  nomReference?: string;

  @IsNumber() @Min(0)
  priceMxn!: number;

  @IsOptional() @IsNumber() @Min(0)
  durationHours?: number;

  @IsOptional() @IsBoolean()
  isPublished?: boolean;

  @IsOptional() @IsNumber() @Min(0)
  validityMonths?: number;
}

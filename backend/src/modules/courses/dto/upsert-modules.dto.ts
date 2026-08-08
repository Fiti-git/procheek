import { ArrayMinSize, IsArray, IsEnum, IsInt, IsOptional, IsString, Length, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ModuleDto {
  @IsOptional() @IsString()
  id?: string;

  @IsInt() @Min(1)
  position!: number;

  @IsString() @Length(2, 200)
  titleEs!: string;

  @IsOptional() @IsString() @Length(2, 200)
  titleEn?: string;

  @IsEnum(['text', 'video', 'url', 'file'])
  contentType!: 'text' | 'video' | 'url' | 'file';

  @IsOptional() @IsString()
  contentUrl?: string;

  @IsOptional() @IsString()
  contentBody?: string;

  @IsOptional() @IsInt() @Min(0)
  durationMin?: number;
}

export class UpsertModulesDto {
  @IsArray() @ArrayMinSize(0) @ValidateNested({ each: true }) @Type(() => ModuleDto)
  modules!: ModuleDto[];
}

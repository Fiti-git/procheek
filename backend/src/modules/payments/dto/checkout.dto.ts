import { ArrayMinSize, IsArray, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutItemDto {
  @IsUUID()
  courseId!: string;

  @IsInt() @Min(1)
  qty!: number;
}

export class CheckoutDto {
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  // Optional: enroll a specific user (defaults to the payer).
  @IsOptional() @IsUUID()
  enrollUserId?: string;
}

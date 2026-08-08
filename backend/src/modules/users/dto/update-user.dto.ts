import { IsBoolean, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Role } from '../../../common/roles';

export class UpdateUserDto {
  @IsOptional() @IsString() @Length(1, 100)
  firstName?: string;

  @IsOptional() @IsString() @Length(1, 100)
  lastName?: string;

  @IsOptional() @IsEnum(Role)
  role?: Role;

  @IsOptional() @IsString()
  curp?: string;

  @IsOptional() @IsString() @Length(2, 5)
  locale?: string;

  @IsOptional() @IsBoolean()
  isActive?: boolean;

  @IsOptional() @IsString() @Length(3, 40)
  username?: string;

  @IsOptional() @IsString() @Length(4, 30)
  phone?: string;

  @IsOptional() @IsString() @Length(1, 500)
  address?: string;

  @IsOptional() @IsString() @Length(1, 100)
  city?: string;

  @IsOptional() @IsString() @Length(1, 100)
  state?: string;

  @IsOptional() @IsString() @Length(1, 20)
  zip?: string;

  @IsOptional() @IsString() @Length(3, 60)
  timezone?: string;
}

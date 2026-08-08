import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { Role } from '../../../common/roles';

export class InviteUserDto {
  @IsEmail()
  email!: string;

  @IsString() @Length(1, 100)
  firstName!: string;

  @IsString() @Length(1, 100)
  lastName!: string;

  @IsEnum(Role)
  role!: Role;

  @IsOptional() @IsUUID()
  companyId?: string;

  @IsOptional() @IsString()
  curp?: string;

  @IsOptional() @IsString() @Length(2, 5)
  locale?: string;
}

import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '../../../common/roles';

export class InviteUserDto {
  @IsEmail()
  email!: string;

  @IsString() @Length(1, 100)
  firstName!: string;

  @IsString() @Length(1, 100)
  lastName!: string;

  // Accept either `role` (canonical) or `roleCode` (alias used by the frontend
  // Team page and QA tooling). If `role` is missing but `roleCode` is present,
  // the transformer promotes it before validation runs.
  @Transform(({ value, obj }) => value ?? obj?.roleCode ?? obj?.role_code)
  @IsEnum(Role)
  role!: Role;

  @IsOptional() @IsUUID()
  companyId?: string;

  @IsOptional() @IsString()
  curp?: string;

  @IsOptional() @IsString() @Length(2, 5)
  locale?: string;
}

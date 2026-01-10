import { IsString, IsEmail, IsDateString, IsEnum } from 'class-validator';
import { UserRole, UserStatus } from '@entities/user.entity';

export class UserDto {
  @IsString()
  surname: string;

  @IsString()
  name: string;

  @IsString()
  fathername: string;

  @IsEmail()
  email: string;

  @IsDateString()
  birthDate: Date;

  @IsEnum(UserRole)
  role: UserRole;

  @IsEnum(UserStatus)
  status: UserStatus;
}

import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserCredentialsDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

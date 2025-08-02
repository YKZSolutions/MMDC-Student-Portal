import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserCredentialsDto {
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @IsNotEmpty({ message: 'Password is not valid' })
  password: string;
}

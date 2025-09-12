import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class UserCredentialsDto {
  @IsEmail({}, { message: 'The value is not a valid email format' })
  email: string;

  @IsOptional()
  @IsNotEmpty({ message: 'The password is empty' })
  password?: string;
}

import { IsEmail } from 'class-validator';
import { CreateUserDto } from '@/generated/nestjs-dto/create-user.dto';

export class InviteUserDto extends CreateUserDto {
  @IsEmail({}, { message: 'The value is not a valid email format' })
  email: string;
}

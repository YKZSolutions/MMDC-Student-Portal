import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { CreateUserDto } from '@/generated/nestjs-dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class InviteUserDto extends CreateUserDto {
  @ApiProperty({
    enum: Role,
    enumName: 'Role',
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Exclude<Role, 'student'>;

  @IsEmail({}, { message: 'The value is not a valid email format' })
  email: string;
}

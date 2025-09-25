import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  title: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
  @ApiProperty({
    isArray: true,
    enum: Role,
    enumName: 'Role',
  })
  @IsNotEmpty()
  @IsArray()
  @IsEnum(Role, { each: true })
  role: Role[];
}

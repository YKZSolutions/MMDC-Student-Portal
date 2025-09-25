import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
  @ApiProperty({
    isArray: true,
    enum: Role,
    enumName: 'Role',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  role?: Role[];
}

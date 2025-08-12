import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateStaffDetailsDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  @IsOptional()
  @IsInt()
  employeeNumber?: number;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  department?: string;
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  position?: string;
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  otherDetails?: Prisma.InputJsonValue;
}

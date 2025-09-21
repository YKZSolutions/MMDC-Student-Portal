import { Prisma, StudentType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDetailsDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  studentNumber?: string;
  @ApiProperty({
    enum: StudentType,
    enumName: 'StudentType',
    required: false,
  })
  @IsOptional()
  @IsEnum(StudentType)
  studentType?: StudentType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  admissionDate?: Date;
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  otherDetails?: Prisma.InputJsonValue;
}

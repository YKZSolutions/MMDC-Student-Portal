import { Prisma, StudentType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';

export class UpdateStudentDetailsDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    required: false,
  })
  @IsOptional()
  @IsInt()
  studentNumber?: number;
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

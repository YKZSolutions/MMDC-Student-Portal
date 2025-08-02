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
  student_number?: number;
  @ApiProperty({
    enum: StudentType,
    enumName: 'StudentType',
    required: false,
  })
  @IsOptional()
  @IsEnum(StudentType)
  student_type?: StudentType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  admission_date?: Date;
  @ApiProperty({
    type: () => Object,
    required: false,
  })
  @IsOptional()
  other_details?: Prisma.InputJsonValue;
}

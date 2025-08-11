import { Prisma, StudentType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class CreateStudentDetailsDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  student_number: number;
  @ApiProperty({
    enum: StudentType,
    enumName: 'StudentType',
  })
  @IsNotEmpty()
  @IsEnum(StudentType)
  student_type: StudentType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  admission_date: Date;
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  other_details: Prisma.InputJsonValue;
}

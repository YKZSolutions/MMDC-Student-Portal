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
  studentNumber: number;
  @ApiProperty({
    enum: StudentType,
    enumName: 'StudentType',
  })
  @IsNotEmpty()
  @IsEnum(StudentType)
  studentType: StudentType;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  admissionDate: Date;
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  otherDetails: Prisma.InputJsonValue;
}

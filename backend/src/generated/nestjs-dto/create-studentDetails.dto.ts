import { Prisma, StudentType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateStudentDetailsDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  studentNumber: string;
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

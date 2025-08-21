import { EnrollmentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentPeriodDto {
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  startYear: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  endYear: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  @IsNotEmpty()
  @IsInt()
  term: number;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
  @ApiProperty({
    enum: EnrollmentStatus,
    enumName: 'EnrollmentStatus',
  })
  @IsNotEmpty()
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}

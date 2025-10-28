import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseEnrollmentCourseOfferingIdStudentIdDeletedAtUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  courseOfferingId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  studentId: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}

@ApiExtraModels(
  CourseEnrollmentCourseOfferingIdStudentIdDeletedAtUniqueInputDto,
)
export class ConnectCourseEnrollmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: CourseEnrollmentCourseOfferingIdStudentIdDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourseEnrollmentCourseOfferingIdStudentIdDeletedAtUniqueInputDto)
  courseOfferingId_studentId_deletedAt?: CourseEnrollmentCourseOfferingIdStudentIdDeletedAtUniqueInputDto;
}

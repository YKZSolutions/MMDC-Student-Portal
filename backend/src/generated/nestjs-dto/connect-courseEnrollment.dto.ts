import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CourseEnrollmentCourseOfferingIdStudentIdUniqueInputDto {
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
}

@ApiExtraModels(CourseEnrollmentCourseOfferingIdStudentIdUniqueInputDto)
export class ConnectCourseEnrollmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: CourseEnrollmentCourseOfferingIdStudentIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourseEnrollmentCourseOfferingIdStudentIdUniqueInputDto)
  courseOfferingId_studentId?: CourseEnrollmentCourseOfferingIdStudentIdUniqueInputDto;
}

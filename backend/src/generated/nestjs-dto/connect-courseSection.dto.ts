import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Days } from '@prisma/client';

export class CourseSectionCourseOfferingIdNameDeletedAtUniqueInputDto {
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
  name: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}
export class CourseSectionCourseOfferingIdMentorIdStartSchedEndSchedDaysDeletedAtUniqueInputDto {
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
  mentorId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  startSched: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  endSched: string;
  @ApiProperty({
    isArray: true,
    enum: Days,
    enumName: 'Days',
  })
  @IsNotEmpty()
  @IsArray()
  @IsEnum(Days, { each: true })
  days: Days[];
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  deletedAt: Date;
}

@ApiExtraModels(
  CourseSectionCourseOfferingIdNameDeletedAtUniqueInputDto,
  CourseSectionCourseOfferingIdMentorIdStartSchedEndSchedDaysDeletedAtUniqueInputDto,
)
export class ConnectCourseSectionDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: CourseSectionCourseOfferingIdNameDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourseSectionCourseOfferingIdNameDeletedAtUniqueInputDto)
  courseOfferingId_name_deletedAt?: CourseSectionCourseOfferingIdNameDeletedAtUniqueInputDto;
  @ApiProperty({
    type: CourseSectionCourseOfferingIdMentorIdStartSchedEndSchedDaysDeletedAtUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(
    () =>
      CourseSectionCourseOfferingIdMentorIdStartSchedEndSchedDaysDeletedAtUniqueInputDto,
  )
  courseOfferingId_mentorId_startSched_endSched_days_deletedAt?: CourseSectionCourseOfferingIdMentorIdStartSchedEndSchedDaysDeletedAtUniqueInputDto;
}

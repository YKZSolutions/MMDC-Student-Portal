import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Days } from '@prisma/client';

export class CourseSectionCourseOfferingIdNameUniqueInputDto {
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
}
export class CourseSectionCourseOfferingIdMentorIdStartSchedEndSchedDaysUniqueInputDto {
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
}

@ApiExtraModels(
  CourseSectionCourseOfferingIdNameUniqueInputDto,
  CourseSectionCourseOfferingIdMentorIdStartSchedEndSchedDaysUniqueInputDto,
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
    type: CourseSectionCourseOfferingIdNameUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CourseSectionCourseOfferingIdNameUniqueInputDto)
  courseOfferingId_name?: CourseSectionCourseOfferingIdNameUniqueInputDto;
  @ApiProperty({
    type: CourseSectionCourseOfferingIdMentorIdStartSchedEndSchedDaysUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(
    () =>
      CourseSectionCourseOfferingIdMentorIdStartSchedEndSchedDaysUniqueInputDto,
  )
  courseOfferingId_mentorId_startSched_endSched_days?: CourseSectionCourseOfferingIdMentorIdStartSchedEndSchedDaysUniqueInputDto;
}

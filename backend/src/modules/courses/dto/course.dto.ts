import { CourseDto as AutoCourseDto } from '@/generated/nestjs-dto/course.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CourseRelationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  courseCode: string;

  @ApiProperty()
  name: string;
}

export class CourseDto extends AutoCourseDto {
  @ApiProperty({ type: () => [CourseRelationDto] })
  prereqs: CourseRelationDto[];

  @ApiProperty({ type: () => [CourseRelationDto] })
  prereqFor: CourseRelationDto[];

  @ApiProperty({ type: () => [CourseRelationDto] })
  coreqs: CourseRelationDto[];

  @ApiProperty({ type: () => [CourseRelationDto] })
  coreqFor: CourseRelationDto[];
}

import { CourseDto } from '@/generated/nestjs-dto/course.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CourseRelationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  courseCode: string;

  @ApiProperty()
  name: string;
}

export class CourseFullDto extends CourseDto {
  @ApiProperty({ type: () => [CourseRelationDto] })
  prereqs: CourseRelationDto[];

  @ApiProperty({ type: () => [CourseRelationDto] })
  coreqs: CourseRelationDto[];
}

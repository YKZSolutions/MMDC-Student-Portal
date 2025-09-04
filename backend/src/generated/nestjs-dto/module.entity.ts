import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  CourseEnrollment,
  type CourseEnrollment as CourseEnrollmentAsType,
} from './courseEnrollment.entity';
import {
  ModuleSection,
  type ModuleSection as ModuleSectionAsType,
} from './moduleSection.entity';

export class Module {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  title: string;
  @ApiProperty({
    type: 'string',
  })
  courseEnrollmentId: string;
  @ApiProperty({
    type: () => CourseEnrollment,
    required: false,
  })
  courseEnrollment?: CourseEnrollmentAsType;
  @ApiHideProperty()
  moduleSections?: ModuleSectionAsType[];
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
}

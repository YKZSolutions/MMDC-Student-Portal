import { Days } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { User, type User as UserAsType } from './user.entity';
import {
  CourseOffering,
  type CourseOffering as CourseOfferingAsType,
} from './courseOffering.entity';
import {
  CourseEnrollment,
  type CourseEnrollment as CourseEnrollmentAsType,
} from './courseEnrollment.entity';
import {
  SectionModule,
  type SectionModule as SectionModuleAsType,
} from './sectionModule.entity';

export class CourseSection {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiHideProperty()
  user?: UserAsType | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  mentorId: string | null;
  @ApiHideProperty()
  courseOffering?: CourseOfferingAsType;
  @ApiProperty({
    type: 'string',
  })
  courseOfferingId: string;
  @ApiProperty({
    type: () => CourseEnrollment,
    isArray: true,
    required: false,
  })
  courseEnrollments?: CourseEnrollmentAsType[];
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  maxSlot: number;
  @ApiProperty({
    type: 'string',
  })
  startSched: string;
  @ApiProperty({
    type: 'string',
  })
  endSched: string;
  @ApiProperty({
    isArray: true,
    enum: Days,
    enumName: 'Days',
  })
  days: Days[];
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
  @ApiHideProperty()
  sectionModules?: SectionModuleAsType[];
}

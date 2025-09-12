import { AssignmentStatus, AssignmentType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class StudentAssignmentsSubmissionsDto {
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
  @ApiProperty({
    type: 'string',
  })
  firstName: string;
  @ApiProperty({
    type: 'string',
  })
  lastName: string;
  @ApiProperty({
    type: 'string',
  })
  course_id: string;
  @ApiProperty({
    type: 'string',
  })
  courseCode: string;
  @ApiProperty({
    type: 'string',
  })
  course_name: string;
  @ApiProperty({
    type: 'string',
  })
  course_offering_id: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  startYear: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  endYear: number;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  term: number;
  @ApiProperty({
    type: 'string',
  })
  module_id: string;
  @ApiProperty({
    type: 'string',
  })
  module_title: string;
  @ApiProperty({
    type: 'string',
  })
  module_content_id: string;
  @ApiProperty({
    type: 'string',
  })
  assignment_title: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  assignment_description: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  dueDate: Date | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  max_points: number | null;
  @ApiProperty({
    enum: AssignmentType,
    enumName: 'AssignmentType',
  })
  assignment_type: AssignmentType;
  @ApiProperty({
    enum: AssignmentStatus,
    enumName: 'AssignmentStatus',
  })
  assignment_status: AssignmentStatus;
  @ApiProperty({
    type: 'boolean',
  })
  allowResubmission: boolean;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  maxAttempts: number | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  submission_id: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  submission_title: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  submission_content: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  score: number | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  grade: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  feedback: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  attemptNumber: number | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
    nullable: true,
  })
  lateDays: number | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  submittedAt: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  gradedAt: Date | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  grader_id: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  grader_first_name: string | null;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  grader_last_name: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  content_completed_at: Date | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  assignment_published_at: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  assignment_created_at: Date;
  @ApiProperty({
    type: 'boolean',
  })
  is_todo: boolean;
}

import {
  ApiProperty,
  IntersectionType,
  OmitType,
  PickType,
} from '@nestjs/swagger';
import { Assignment } from '@/generated/nestjs-dto/assignment.entity';
import { AssignmentSubmissionDto } from '@/generated/nestjs-dto/assignmentSubmission.dto';
import { CurrentGradeDto } from '@/modules/lms/grading/dto/studentGradebookDto';
import { UserDto } from '@/generated/nestjs-dto/user.dto';

/**
 * The base interface for any gradable item within a module.
 * It contains properties common to both Assignments and Quizzes.
 */
class BaseGradableItem {
  @ApiProperty({ description: 'The unique ID of the ModuleContent record.' })
  contentId: string;

  @ApiProperty({ description: 'The module id of the ModuleContent record.' })
  moduleId: string;

  @ApiProperty({ description: 'The title of the gradable item.' })
  title: string;
}

/**
 * Represents a gradable item that is an Assignment.
 */
export class GradableAssignmentItem extends IntersectionType(
  BaseGradableItem,
  OmitType(Assignment, [
    'moduleContent',
    'id',
    'rubricTemplateId',
    'submissions',
    'createdAt',
    'updatedAt',
    'deletedAt',
  ]),
) {}

export class BasicAssignmentSubmission extends PickType(
  AssignmentSubmissionDto,
  ['id', 'state', 'groupSnapshot', 'submittedAt', 'lateDays'],
) {
  @ApiProperty({
    type: UserDto,
    required: true,
    nullable: false,
  })
  student: UserDto;
}

export class BasicAssignmentSubmissionItemWithGrade extends BasicAssignmentSubmission {
  @ApiProperty({
    type: CurrentGradeDto,
    required: false,
    nullable: true,
  })
  currentGrade: CurrentGradeDto | null;
}

export class FullGradableAssignmentItem extends IntersectionType(
  BaseGradableItem,
  PickType(Assignment, [
    'rubricTemplate',
    'mode',
    'maxScore',
    'weightPercentage',
    'maxAttempts',
    'allowLateSubmission',
    'latePenalty',
    'dueDate',
    'gracePeriodMinutes',
  ]),
) {
  @ApiProperty({
    type: BasicAssignmentSubmissionItemWithGrade,
    isArray: true,
    description: 'The submissions of the assignment.',
  })
  submissions: BasicAssignmentSubmissionItemWithGrade[];
}

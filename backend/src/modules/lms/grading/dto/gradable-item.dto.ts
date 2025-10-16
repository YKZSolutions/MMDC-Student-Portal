import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { Assignment } from '@/generated/nestjs-dto/assignment.entity';
import { AssignmentSubmission } from '@/generated/nestjs-dto/assignmentSubmission.entity';

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
  OmitType(AssignmentSubmission, [
    'assignment',
    'content',
    'createdAt',
    'updatedAt',
    'deletedAt',
    'id',
    'studentId',
    'attachments',
    'group',
  ]),
) {}

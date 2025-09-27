import { ApiProperty } from '@nestjs/swagger';
import { ContentType, Prisma } from '@prisma/client';

/**
 * A simplified representation of the grading configuration,
 * containing information relevant to the gradebook view.
 */
class GradableItemGradingConfig {
  @ApiProperty({
    description: 'The weight of this item in the final grade calculation.',
    type: String,
    format: 'Decimal.js',
    nullable: true,
  })
  weight: Prisma.Decimal | null;
}

/**
 * The base interface for any gradable item within a module.
 * It contains properties common to both Assignments and Quizzes.
 */
class BaseGradableItem {
  @ApiProperty({ description: 'The unique ID of the ModuleContent record.' })
  id: string;

  @ApiProperty({ description: 'The id of the ModuleContent record.' })
  moduleId: string;

  @ApiProperty({ description: 'The title of the gradable item.' })
  title: string;

  @ApiProperty({
    description: 'The due date for the item.',
    type: Date,
    nullable: true,
  })
  dueDate: Date | null;

  @ApiProperty({
    description: 'The order of the item within its module section.',
  })
  order: number;

  @ApiProperty({
    type: () => GradableItemGradingConfig,
    description: 'Grading configuration for the item.',
  })
  grading: GradableItemGradingConfig;
}

/**
 * Represents a gradable item that is an Assignment.
 */
export class GradableAssignmentItem extends BaseGradableItem {
  @ApiProperty({
    enum: [ContentType.ASSIGNMENT],
    description: 'The type of content, which is always ASSIGNMENT.',
  })
  contentType: 'ASSIGNMENT';

  @ApiProperty({
    description: 'The unique ID of the underlying assignment.',
  })
  assignmentId: string;
}

/**
 * Represents a gradable item that is a Quiz.
 */
export class GradableQuizItem extends BaseGradableItem {
  @ApiProperty({
    enum: [ContentType.QUIZ],
    description: 'The type of content, which is always QUIZ.',
  })
  contentType: 'QUIZ';

  @ApiProperty({
    description: 'The unique ID of the underlying quiz.',
  })
  quizId: string;
}

/**
 * A discriminated union type representing any kind of gradable item.
 * This allows for type-safe access to item-specific properties.
 */
export type GradableItem = GradableAssignmentItem | GradableQuizItem;

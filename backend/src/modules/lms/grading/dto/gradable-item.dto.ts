import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';

/**
 * A simplified representation of the grading configuration,
 * containing information relevant to the gradebook view.
 */
class GradableItemGradingConfig {
  @ApiProperty({
    description: 'The weight of this item in the final grade calculation.',
    type: Number,
    nullable: true,
  })
  weight: number | null;
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
 * A discriminated union type representing any kind of gradable item.
 * This allows for type-safe access to item-specific properties.
 */
export type GradableItem = GradableAssignmentItem;

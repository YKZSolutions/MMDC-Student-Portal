import { ApiProperty, IntersectionType, OmitType } from '@nestjs/swagger';
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { ContentType } from '@prisma/client';

class ModuleTreeBase extends OmitType(ModuleContent, [
  'content',
  'contentType',
  'moduleSection',
  'assignment',
  'deletedAt',
]) {}

export class ModuleTreeAssignmentItemDto extends IntersectionType(
  ModuleTreeBase,
  AssignmentDto,
) {
  @ApiProperty({
    default: ContentType.ASSIGNMENT,
    readOnly: true,
  })
  declare contentType: 'ASSIGNMENT';
}

export class ModuleTreeLessonItemDto extends ModuleTreeBase {
  @ApiProperty({
    default: ContentType.LESSON,
    readOnly: true,
  })
  declare contentType: 'LESSON';
}

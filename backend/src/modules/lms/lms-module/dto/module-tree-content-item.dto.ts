import { ApiProperty, OmitType } from '@nestjs/swagger';
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

export class ModuleTreeAssignmentItemDto extends ModuleTreeBase {
  @ApiProperty({
    default: ContentType.ASSIGNMENT,
    readOnly: true,
  })
  declare contentType: 'ASSIGNMENT';

  @ApiProperty({
    type: AssignmentDto,
  })
  assignment: AssignmentDto;
}

export class ModuleTreeLessonItemDto extends ModuleTreeBase {
  @ApiProperty({
    default: ContentType.LESSON,
    readOnly: true,
  })
  declare contentType: 'LESSON';
}

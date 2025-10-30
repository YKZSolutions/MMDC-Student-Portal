import { ApiProperty, OmitType } from '@nestjs/swagger';
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';
import { ContentType } from '@prisma/client';
import { StudentAssignmentSubmissionItemDto } from '@/modules/lms/assignment/dto/paginated-assignment.dto';

class ModuleTreeBase extends OmitType(ModuleContent, [
  'content',
  'contentType',
  'moduleSection',
  'assignment',
  'deletedAt',
]) {}

class ModuleTreeAssignmentDto extends AssignmentDto {
  @ApiProperty({
    type: [StudentAssignmentSubmissionItemDto],
    required: false,
  })
  studentSubmissions?: StudentAssignmentSubmissionItemDto[];
}

export class ModuleTreeAssignmentItemDto extends ModuleTreeBase {
  @ApiProperty({
    default: ContentType.ASSIGNMENT,
    readOnly: true,
  })
  declare contentType: 'ASSIGNMENT';

  @ApiProperty({
    type: ModuleTreeAssignmentDto,
  })
  assignment: ModuleTreeAssignmentDto;
}

export class ModuleTreeLessonItemDto extends ModuleTreeBase {
  @ApiProperty({
    default: ContentType.LESSON,
    readOnly: true,
  })
  declare contentType: 'LESSON';
}

import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';

export class LessonItemDto extends ModuleContentDto {
  @ApiProperty({
    enum: [ContentType.LESSON],
    default: ContentType.LESSON,
  })
  declare contentType: 'LESSON';
}

export class AssignmentConfigDto extends AssignmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  rubricTemplateId?: string | null;
}

export class AssignmentItemDto extends ModuleContentDto {
  @ApiProperty({
    enum: [ContentType.ASSIGNMENT],
    default: ContentType.ASSIGNMENT,
  })
  declare contentType: 'ASSIGNMENT';

  @ApiProperty({
    type: AssignmentConfigDto,
  })
  assignment: AssignmentConfigDto;
}

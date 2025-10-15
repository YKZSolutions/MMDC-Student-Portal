import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import { UpdateAssignmentDto } from '@/generated/nestjs-dto/update-assignment.dto';

export class UpdateLessonItemDto extends UpdateModuleContentDto {
  @ApiProperty({
    enum: [ContentType.LESSON],
    default: ContentType.LESSON,
  })
  declare contentType: 'LESSON';
}

export class UpdateAssignmentConfigDto extends UpdateAssignmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  rubricTemplateId?: string | null;
}

export class UpdateAssignmentItemDto extends IntersectionType(
  UpdateAssignmentConfigDto,
  UpdateModuleContentDto,
) {
  @ApiProperty({
    enum: [ContentType.ASSIGNMENT],
    default: ContentType.ASSIGNMENT,
  })
  contentType: 'ASSIGNMENT';
}

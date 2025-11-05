import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { ContentProgress } from '@/generated/nestjs-dto/contentProgress.entity';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';

export class LessonItemDto extends ModuleContentDto {
  @ApiProperty({
    enum: ContentType,  // Full enum, not array
    enumName: 'ContentType',
    default: ContentType.LESSON,
  })
  declare contentType: 'LESSON';

  @ApiProperty({
    type: () => ContentProgress,
    isArray: true,
    required: false,
  })
  studentProgress?: ContentProgress[];
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
    enum: ContentType,  // Full enum, not array
    enumName: 'ContentType',
    default: ContentType.ASSIGNMENT,
  })
  declare contentType: 'ASSIGNMENT';

  @ApiProperty({
    type: AssignmentConfigDto,
  })
  assignment: AssignmentConfigDto;

  @ApiProperty({
    type: () => ContentProgress,
    isArray: true,
    required: false,
  })
  studentProgress?: ContentProgress[];
}

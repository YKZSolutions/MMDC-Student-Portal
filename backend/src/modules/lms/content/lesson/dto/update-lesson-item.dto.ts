import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { UpdateLessonDto } from '@/generated/nestjs-dto/update-lesson.dto';
import { ContentType } from '@prisma/client';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateLessonItemDto extends IntersectionType(
  UpdateLessonDto,
  UpdateModuleContentDto,
) {
  @ApiProperty({
    enum: [ContentType.LESSON],
    default: ContentType.LESSON,
  })
  declare contentType: 'LESSON';

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;
}

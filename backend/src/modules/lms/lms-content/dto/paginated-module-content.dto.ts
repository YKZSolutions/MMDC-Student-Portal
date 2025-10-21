import { PaginatedDto } from '@/common/dto/paginated.dto';
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';
import {
  AssignmentItemDto,
  LessonItemDto,
} from '@/modules/lms/lms-content/dto/full-module-content.dto';
import { FullModuleContent } from '@/modules/lms/lms-content/types';

export class PaginatedModuleContentDto extends PaginatedDto {
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(LessonItemDto) },
      { $ref: getSchemaPath(AssignmentItemDto) },
    ],
    discriminator: {
      propertyName: 'contentType',
      mapping: {
        [ContentType.LESSON]: getSchemaPath(LessonItemDto),
        [ContentType.ASSIGNMENT]: getSchemaPath(AssignmentItemDto),
      },
    },
    isArray: true,
  })
  @ApiExtraModels(LessonItemDto, AssignmentItemDto)
  moduleContents: FullModuleContent[];
}

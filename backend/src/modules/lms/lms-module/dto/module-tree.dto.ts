import {
  ApiExtraModels,
  ApiProperty,
  getSchemaPath,
  PickType,
} from '@nestjs/swagger';
import { Module } from '@/generated/nestjs-dto/module.entity';
import { ModuleSection } from '@/generated/nestjs-dto/moduleSection.entity';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ModuleTreeAssignmentItemDto,
  ModuleTreeLessonItemDto,
} from '@/modules/lms/lms-module/dto/module-tree-content-item.dto';
import { ContentType } from '@prisma/client';
import { ModuleTreeContentItem } from '@/modules/lms/lms-content/types';

export class ModuleTreeDto extends PickType(Module, [
  'id',
  'title',
  'courseId',
  'progresses',
  'publishedAt',
  'unpublishedAt',
] as const) {
  @ApiProperty({
    type: () => [ModuleTreeSectionDto],
    required: false,
  })
  @ValidateNested({ each: true })
  @Type(() => ModuleTreeSectionDto)
  moduleSections: ModuleTreeSectionDto[];
}

export class ModuleTreeSectionDto extends PickType(ModuleSection, [
  'id',
  'moduleId',
  'parentSectionId',
  'prerequisiteSectionId',
  'title',
  'order',
  'publishedAt',
  'unpublishedAt',
]) {
  @ApiProperty({
    type: () => [ModuleTreeSectionDto],
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ModuleTreeSectionDto)
  subsections?: ModuleTreeSectionDto[];

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(ModuleTreeLessonItemDto) },
      { $ref: getSchemaPath(ModuleTreeAssignmentItemDto) },
    ],
    discriminator: {
      propertyName: 'contentType',
      mapping: {
        [ContentType.LESSON]: getSchemaPath(ModuleTreeLessonItemDto),
        [ContentType.ASSIGNMENT]: getSchemaPath(ModuleTreeAssignmentItemDto),
      },
    },
    isArray: true,
  })
  @ApiExtraModels(ModuleTreeLessonItemDto, ModuleTreeAssignmentItemDto)
  @IsOptional()
  @ValidateNested({ each: true })
  moduleContents?: ModuleTreeContentItem[];
}

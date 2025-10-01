import { ApiProperty, PickType } from '@nestjs/swagger';
import { Module } from '@/generated/nestjs-dto/module.entity';
import { ModuleSection } from '@/generated/nestjs-dto/moduleSection.entity';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BasicModuleItemDto } from '@/modules/lms/dto/basic-module-item.dto';

export class ModuleTreeDto extends PickType(Module, [
  'id',
  'title',
  'courseId',
  'progresses',
  'publishedAt',
  'toPublishAt',
  'unpublishedAt',
] as const) {
  @ApiProperty({
    type: () => [ModuleTreeSectionDto],
    required: false,
    nullable: true,
  })
  @ValidateNested()
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
  'toPublishAt',
  'unpublishedAt',
]) {
  @ApiProperty({
    type: () => [ModuleTreeSectionDto],
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ModuleTreeSectionDto)
  subsections?: ModuleTreeSectionDto[];

  @ApiProperty({
    type: () => [BasicModuleItemDto],
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicModuleItemDto)
  moduleContents?: BasicModuleItemDto[];
}

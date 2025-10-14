import { ApiProperty, PickType } from '@nestjs/swagger';
import { Module } from '@/generated/nestjs-dto/module.entity';
import { ModuleSection } from '@/generated/nestjs-dto/moduleSection.entity';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ModuleTreeContentItemDto } from '@/modules/lms/lms-module/dto/module-tree-content-item.dto';

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
    type: () => [ModuleTreeContentItemDto],
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ModuleTreeContentItemDto)
  moduleContents?: ModuleTreeContentItemDto[];
}

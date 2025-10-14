import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';

export class ModuleTreeContentItemDto extends PickType(ModuleContent, [
  'id',
  'moduleSectionId',
  'contentType',
  'title',
  'subtitle',
  'order',
  'publishedAt',
  'unpublishedAt',
  'createdAt',
  'updatedAt',
  'studentProgress',
]) {
  @ApiProperty({
    type: () => AssignmentDto,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AssignmentDto)
  assignment: AssignmentDto | null;
}

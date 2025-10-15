import { ApiProperty, PickType } from '@nestjs/swagger';
import { ModuleContent } from '@/generated/nestjs-dto/moduleContent.entity';

export class ModuleContentInfoDto extends PickType(ModuleContent, [
  'id',
  'contentType',
  'order',
  'moduleSectionId',
] as const) {}

export class DetailedContentProgressDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  completedAt: Date | null;

  @ApiProperty()
  studentId: string;

  @ApiProperty({ type: () => ModuleContentInfoDto })
  moduleContent: ModuleContentInfoDto;
}

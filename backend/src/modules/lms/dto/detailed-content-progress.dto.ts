import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class ModuleContentInfoDto extends PickType(ModuleContentDto, [
  'id',
  'contentType',
  'order',
] as const) {
  @ApiProperty({ nullable: true })
  moduleSectionId: string | null;

  @ApiProperty()
  moduleId: string;
}

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

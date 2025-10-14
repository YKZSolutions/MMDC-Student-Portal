import { PaginatedDto } from '@/common/dto/paginated.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ModuleTreeContentItemDto } from '@/modules/lms/lms-module/dto/module-tree-content-item.dto';

export class PaginatedModuleContentDto extends PaginatedDto {
  @ApiProperty({
    type: () => ModuleTreeContentItemDto,
    isArray: true,
  })
  moduleContents: ModuleTreeContentItemDto[];
}

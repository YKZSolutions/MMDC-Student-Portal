import { PaginatedDto } from '@/common/dto/paginated.dto';
import { ApiProperty } from '@nestjs/swagger';
import { BasicModuleItemDto } from '@/modules/lms/dto/basic-module-item.dto';

export class PaginatedModuleContentDto extends PaginatedDto {
  @ApiProperty({
    type: () => BasicModuleItemDto,
    isArray: true,
  })
  moduleContents: BasicModuleItemDto[];
}

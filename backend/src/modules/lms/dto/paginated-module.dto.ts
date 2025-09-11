import { PaginatedDto } from '@/common/dto/paginated.dto';
import { ModuleDto } from '@/generated/nestjs-dto/module.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedModulesDto extends PaginatedDto {
  @ApiProperty({
    type: () => ModuleDto,
    isArray: true,
  })
  modules: ModuleDto[];
}

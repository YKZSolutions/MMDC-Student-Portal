import { PaginatedDto } from '@/common/dto/paginated.dto';
import { YearLevelDto } from '@/generated/nestjs-dto/yearLevel.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedYearLevelsDto extends PaginatedDto {
  @ApiProperty()
  yearLevels: YearLevelDto[];
}

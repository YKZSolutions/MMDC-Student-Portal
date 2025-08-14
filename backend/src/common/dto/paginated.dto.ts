import { PaginationMetaDto } from '@/modules/meta/dto/pagination-meta.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  PageNumberPagination,
  PageNumberCounters,
} from 'prisma-extension-pagination/dist/types';

export class PaginatedDto<T> {
  @ApiProperty({
    type: PaginationMetaDto,
    additionalProperties: true,
    nullable: false,
  })
  meta: PageNumberPagination & PageNumberCounters;
}

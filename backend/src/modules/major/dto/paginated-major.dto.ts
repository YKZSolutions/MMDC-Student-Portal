import { MajorDto } from '@/generated/nestjs-dto/major.dto';
import { PaginationMetaDto } from '@/modules/meta/dto/pagination-meta.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  PageNumberCounters,
  PageNumberPagination,
} from 'prisma-extension-pagination/dist/types';

export class PaginatedMajorDto {
  @ApiProperty()
  majors: MajorDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    additionalProperties: true,
    nullable: false,
  })
  meta: PageNumberPagination & PageNumberCounters;
}

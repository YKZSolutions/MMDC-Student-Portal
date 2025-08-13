import { ProgramDto } from '@/generated/nestjs-dto/program.dto';
import { PaginationMetaDto } from '@/modules/meta/dto/pagination-meta.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  PageNumberCounters,
  PageNumberPagination,
} from 'prisma-extension-pagination/dist/types';

export class PaginatedProgramsDto {
  @ApiProperty()
  programs: ProgramDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    additionalProperties: true,
    nullable: false,
  })
  meta: PageNumberPagination & PageNumberCounters;
}

import { PaginationMetaDto } from '@/modules/meta/dto/pagination-meta.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  PageNumberCounters,
  PageNumberPagination,
} from 'prisma-extension-pagination/dist/types';
import { UserWithRelations } from './user-with-relations.dto';

export class PaginatedUsersDto {
  @ApiProperty({ type: [UserWithRelations] })
  users: UserWithRelations[];

  @ApiProperty({ type: PaginationMetaDto, additionalProperties: true, nullable: false })
  meta: PageNumberPagination & PageNumberCounters;
}

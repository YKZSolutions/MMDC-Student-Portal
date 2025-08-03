import { User } from '@/generated/interfaces';
import { PaginationMetaDto } from '@/modules/meta/dto/pagination-meta.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
    PageNumberCounters,
    PageNumberPagination,
} from 'prisma-extension-pagination/dist/types';

export class PaginatedUsersDto {
  @ApiProperty({ type: [User] })
  users: User[];

  @ApiProperty({ type: PaginationMetaDto, additionalProperties: true, nullable: false })
  meta: PageNumberPagination & PageNumberCounters;
}

import { User } from '@/generated/interfaces';
import { ApiProperty } from '@nestjs/swagger';
import {
    PageNumberCounters,
    PageNumberPagination,
} from 'prisma-extension-pagination/dist/types';

export class PaginationMetaDto {
  @ApiProperty({ type: 'boolean', example: true })
  isFirstPage: boolean;

  @ApiProperty({ type: 'boolean', example: true })
  isLastPage: boolean;

  @ApiProperty({ type: 'number', example: 1 })
  currentPage: number;

  @ApiProperty({ type: 'number', example: null, nullable: true })
  previousPage: number | null;

  @ApiProperty({ type: 'number', example: null, nullable: true })
  nextPage: number | null;

  @ApiProperty({ type: 'number', example: 1 })
  pageCount: number;

  @ApiProperty({ type: 'number', example: 42 })
  totalCount: number;
}

export class PaginatedUsersDto {
  @ApiProperty({ type: [User] })
  users: User[];

  @ApiProperty({ type: PaginationMetaDto, additionalProperties: true, nullable: false })
  meta: PageNumberPagination & PageNumberCounters;
}

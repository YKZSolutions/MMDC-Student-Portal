import { ApiProperty } from '@nestjs/swagger';

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

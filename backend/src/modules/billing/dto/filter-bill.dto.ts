import { ApiPropertyOptional } from '@nestjs/swagger';
import { BillType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

enum FilterBillSort {
  status = 'status',
  amount = 'amount',
  dueAt = 'dueAt',
  createdAt = 'createdAt',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

enum BillStatus {
  paid = 'paid',
  unpaid = 'unpaid',
  overpaid = 'overpaid',
}

export class FilterBillDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(FilterBillSort)
  sort?: FilterBillSort;

  @ApiPropertyOptional({ default: SortOrder.desc })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @IsOptional()
  @IsEnum(BillStatus)
  status?: BillStatus;

  @IsOptional()
  @IsEnum(BillType)
  type?: BillType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}

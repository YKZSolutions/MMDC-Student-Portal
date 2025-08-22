import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentScheme } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

enum FilterBillSort {
  amountToPay = 'amountToPay',
  totalPaid = 'totalPaid',
  dueAt = 'dueAt',
  createdAt = 'createdAt',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

export enum BillStatus {
  unpaid = 'unpaid',
  partial = 'partial',
  paid = 'paid',
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

  @ApiPropertyOptional({
    enumName: 'PaymentScheme',
    enum: PaymentScheme,
  })
  @IsOptional()
  @IsEnum(PaymentScheme)
  scheme?: PaymentScheme;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;
}

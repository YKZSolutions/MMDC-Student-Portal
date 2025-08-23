import { CreateBillDto } from '@/generated/nestjs-dto/create-bill.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreateBillingDto {
  @ValidateNested()
  @Type(() => CreateBillDto)
  bill: CreateBillDto;

  @ApiProperty({
    type: 'string',
    isArray: true,
    format: 'date-time',
    example: [
      '2025-01-01T00:00:00Z',
      '2025-02-01T12:30:00Z',
      '2025-03-01T12:30:00Z',
    ],
  })
  @IsArray()
  @IsDateString({}, { each: true })
  dueDates: string[];

  @IsOptional()
  @IsUUID()
  userId?: string;
}

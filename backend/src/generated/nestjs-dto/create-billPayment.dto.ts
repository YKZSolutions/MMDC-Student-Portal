import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsDecimal, IsNotEmpty, IsString } from 'class-validator';

export class CreateBillPaymentDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  amountPaid: Prisma.Decimal;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  paymentType: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  notes: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  @IsNotEmpty()
  @IsDateString()
  paymentDate: Date;
  @ApiProperty({
    type: () => Object,
  })
  @IsNotEmpty()
  paymongoData: PrismaJson.PayMongoData;
}

import { PaymentType, Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBillPaymentDto {
  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
  })
  @IsNotEmpty()
  @IsDecimal()
  amountPaid: Prisma.Decimal;
  @ApiProperty({
    enum: PaymentType,
    enumName: 'PaymentType',
  })
  @IsNotEmpty()
  @IsEnum(PaymentType)
  paymentType: PaymentType;
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
    required: false,
    nullable: true,
  })
  @IsOptional()
  paymongoData?: PrismaJson.PayMongoData | null;
}

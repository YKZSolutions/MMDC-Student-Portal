import { Prisma } from '@prisma/client';
import { ApiExtraModels, ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsDecimal,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConnectBillDto,
  type ConnectBillDto as ConnectBillDtoAsType,
} from './connect-bill.dto';

export class CreateBillPaymentBillRelationInputDto {
  @ApiProperty({
    type: ConnectBillDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ConnectBillDto)
  connect: ConnectBillDtoAsType;
}

@ApiExtraModels(ConnectBillDto, CreateBillPaymentBillRelationInputDto)
export class CreateBillPaymentDto {
  @ApiHideProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateBillPaymentBillRelationInputDto)
  bill: CreateBillPaymentBillRelationInputDto;
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
}

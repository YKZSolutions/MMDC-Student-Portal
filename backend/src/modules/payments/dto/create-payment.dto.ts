import { CreateBillPaymentDto } from '@/generated/nestjs-dto/create-billPayment.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class CreatePaymentDto {
  @ValidateNested()
  @Type(() => CreateBillPaymentDto)
  payment: CreateBillPaymentDto;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  statementDescriptor: string;
}

import { CreateBillPaymentDto } from '@/generated/nestjs-dto/create-billPayment.dto';
import { OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

class CreatePayment extends OmitType(CreateBillPaymentDto, [
  'installmentOrder',
]) {}

export class CreatePaymentDto {
  @ValidateNested()
  @Type(() => CreatePayment)
  payment: CreatePayment;

  @IsOptional()
  @IsUUID()
  installmentId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  statementDescriptor?: string;
}

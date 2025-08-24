import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class InitiatePaymentDto {
  @IsUUID()
  installmentId: string;

  @IsNumber()
  installmentOrder: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  statementDescriptor?: string;

  @IsNumber()
  amount: number;
}

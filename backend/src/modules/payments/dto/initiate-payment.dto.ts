import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class InitiatePaymentDto {
  @IsOptional()
  @IsUUID()
  installmentId?: string;

  @IsOptional()
  @IsNumber()
  installmentOrder?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  statementDescriptor?: string;

  @IsNumber()
  amount: number;
}

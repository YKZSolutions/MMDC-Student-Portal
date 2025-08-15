import { IsNumber, IsOptional, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  statementDescriptor?: string;

  @IsNumber()
  amount: number;
}

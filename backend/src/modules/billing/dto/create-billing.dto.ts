import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBillingDto {
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  billingId: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  statement?: string;

  @IsOptional()
  metadata?: object;
}

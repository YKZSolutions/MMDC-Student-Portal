import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateBillingDto {
  @IsNotEmpty()
  amount: number;

  @IsOptional()
  description: string;

  @IsOptional()
  statement: string;

  @IsOptional()
  metadata: object;
}

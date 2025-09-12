import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class PaymentIntentAttributesDto {
  @IsNumber()
  amount: number;

  @IsString()
  capture_type: string;

  @IsString()
  client_key: string;

  @IsNumber()
  created_at: number;

  @IsString()
  currency: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  last_payment_error?: string | null;

  @IsBoolean()
  livemode: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any> | null;

  @IsOptional()
  @IsObject()
  next_action?: Record<string, any> | null;

  @IsNumber()
  original_amount: number;

  @IsArray()
  @IsString({ each: true })
  payment_method_allowed: string[];

  @IsOptional()
  @IsObject()
  payment_method_options?: Record<string, any> | null;

  @IsArray()
  payments: any[];

  @IsOptional()
  @IsString()
  setup_future_usage?: string | null;

  @IsString()
  statement_descriptor: string;

  @IsString()
  status: string;

  @IsNumber()
  updated_at: number;
}

export class PaymentIntentDataDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsNotEmpty()
  @IsObject()
  attributes: PaymentIntentAttributesDto;
}

export class PaymentIntentResponseDto {
  @IsNotEmpty()
  @IsObject()
  data: PaymentIntentDataDto;
}

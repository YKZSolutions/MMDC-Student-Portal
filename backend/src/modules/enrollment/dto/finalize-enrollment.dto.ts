import { ApiProperty } from '@nestjs/swagger';
import { PaymentScheme } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class FinalizeEnrollmentDto {
  @IsOptional()
  @IsUUID('4')
  studentId?: string;

  @ApiProperty({
    enumName: 'PaymentScheme',
    enum: PaymentScheme,
  })
  @IsEnum(PaymentScheme)
  paymentScheme: PaymentScheme;
}

import { IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateBillPaymentDto } from '@/generated/nestjs-dto/update-billPayment.dto';

export class UpdatePaymentDto {
  @ValidateNested()
  @Type(() => UpdateBillPaymentDto)
  payment: UpdateBillPaymentDto;

  @IsUUID()
  id: string;
}

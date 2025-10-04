import { UpdateEnrollmentPeriodDto } from '@/generated/nestjs-dto/update-enrollmentPeriod.dto';
import { OmitType } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateEnrollmentPeriodItemDto extends OmitType(
  UpdateEnrollmentPeriodDto,
  ['status'],
) {
  @IsUUID()
  pricingGroupId: string;
}

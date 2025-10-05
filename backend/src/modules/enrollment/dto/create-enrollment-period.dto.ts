import { CreateEnrollmentPeriodDto } from '@/generated/nestjs-dto/create-enrollmentPeriod.dto';
import { IsUUID } from 'class-validator';

export class CreateEnrollmentPeriodItemDto extends CreateEnrollmentPeriodDto {
  @IsUUID()
  pricingGroupId: string;
}

import { UpdateEnrollmentPeriodDto } from '@/generated/nestjs-dto/update-enrollmentPeriod.dto';
import { PickType } from '@nestjs/mapped-types';

export class UpdateEnrollmentStatusDto extends PickType(
  UpdateEnrollmentPeriodDto,
  ['status'] as const,
) {}

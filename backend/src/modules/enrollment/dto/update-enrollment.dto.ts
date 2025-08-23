import { UpdateEnrollmentPeriodDto } from '@/generated/nestjs-dto/update-enrollmentPeriod.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateEnrollmentDto extends OmitType(UpdateEnrollmentPeriodDto, [
  'status',
]) {}

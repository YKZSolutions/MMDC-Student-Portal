import { OmitType } from '@nestjs/swagger';
import { UpdateAppointmentDto } from '@/generated/nestjs-dto/update-appointment.dto';

export class UpdateAppointmentItemDto extends OmitType(UpdateAppointmentDto, [
  'startAt',
  'endAt',
  'cancelReason',
]) {}

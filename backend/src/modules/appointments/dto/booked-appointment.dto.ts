import { AppointmentDto } from '@/generated/nestjs-dto/appointment.dto';
import { UpdateAppointmentDto } from '@/generated/nestjs-dto/update-appointment.dto';
import { PickType } from '@nestjs/swagger';

export class BookedAppointmentDto extends PickType(AppointmentDto, [
  'id',
  'startAt',
  'endAt',
] as const) {}

export class BookedAppointmentFilterDto extends PickType(UpdateAppointmentDto, [
  'startAt',
  'endAt',
] as const) {}

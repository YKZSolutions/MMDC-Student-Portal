import { AppointmentDto } from '@/generated/nestjs-dto/appointment.dto';
import { PickType } from '@nestjs/swagger';

export class BookedAppointment extends PickType(AppointmentDto, [
  'id',
  'startAt',
  'endAt',
]) {}

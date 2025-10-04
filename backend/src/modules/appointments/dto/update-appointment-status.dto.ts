import { UpdateAppointmentDto } from '@/generated/nestjs-dto/update-appointment.dto';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateAppointmentStatusDto extends PickType(UpdateAppointmentDto, [
  'startAt',
  'endAt',
  'cancelReason',
]) {
  @ApiProperty({
    enum: AppointmentStatus,
    enumName: 'AppointmentStatus',
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
}

import { CreateAppointmentDto } from '@/generated/nestjs-dto/create-appointment.dto';
import { OmitType } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateAppointmentItemDto extends OmitType(CreateAppointmentDto, [
  'description',
]) {
  @IsUUID()
  courseOfferingId: string;
  @IsUUID()
  studentId: string;
  @IsUUID()
  mentorId: string;

  @IsString()
  description: string;
}

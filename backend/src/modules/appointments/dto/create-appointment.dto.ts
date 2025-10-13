import { CreateAppointmentDto } from '@/generated/nestjs-dto/create-appointment.dto';
import { IsUUID } from 'class-validator';

export class CreateAppointmentItemDto extends CreateAppointmentDto {
  @IsUUID()
  courseOfferingId: string;
  @IsUUID()
  studentId: string;
  @IsUUID()
  mentorId: string;
}

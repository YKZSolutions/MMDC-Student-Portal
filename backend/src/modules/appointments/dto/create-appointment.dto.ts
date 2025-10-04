import { CreateAppointmentDto } from '@/generated/nestjs-dto/create-appointment.dto';
import { IsUUID } from 'class-validator';

export class CreateAppointmentItemDto extends CreateAppointmentDto {
  @IsUUID()
  courseId: string;
  @IsUUID()
  studentId: string;
  @IsUUID()
  mentorId: string;
}

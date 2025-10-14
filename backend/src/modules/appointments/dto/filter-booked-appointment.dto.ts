import { IsDateString, IsUUID } from 'class-validator';

export class FilterBookedAppointment {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsUUID()
  courseId: string;

  @IsUUID()
  mentorId: string;
}

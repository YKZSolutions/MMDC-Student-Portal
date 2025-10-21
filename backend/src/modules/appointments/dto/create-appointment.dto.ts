import { CreateAppointmentDto } from '@/generated/nestjs-dto/create-appointment.dto';
import { OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentItemDto extends OmitType(CreateAppointmentDto, [
  'description',
]) {
  @IsUUID()
  @IsNotEmpty()
  courseOfferingId: string;
  @IsUUID()
  @IsNotEmpty()
  studentId: string;
  @IsUUID()
  @IsNotEmpty()
  mentorId: string;

  @IsString()
  description: string;
}

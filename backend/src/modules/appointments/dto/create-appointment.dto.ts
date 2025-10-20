import { CreateAppointmentDto } from '@/generated/nestjs-dto/create-appointment.dto';
import { OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateAppointmentItemDto extends OmitType(CreateAppointmentDto, [
  'description',
]) {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  courseOfferingId: string;
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  studentId: string;
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  mentorId: string;

  @IsString()
  description: string;
}

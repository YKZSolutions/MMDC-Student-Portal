import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTranscriptDto {
  @IsUUID()
  @IsNotEmpty()
  courseOfferingId: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;
}

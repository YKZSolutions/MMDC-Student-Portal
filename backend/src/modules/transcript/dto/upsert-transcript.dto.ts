import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpsertTranscriptDto {
  @IsUUID()
  @IsNotEmpty()
  courseOfferingId: string;

  @IsUUID()
  @IsNotEmpty()
  studentId: string;
}

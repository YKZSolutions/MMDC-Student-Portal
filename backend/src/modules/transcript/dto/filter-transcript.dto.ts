import { IsOptional, IsUUID } from 'class-validator';

export class FilterTranscriptDto {
  @IsUUID()
  @IsOptional()
  enrollmentPeriodId?: string;

  @IsUUID()
  @IsOptional()
  studentId?: string;
}

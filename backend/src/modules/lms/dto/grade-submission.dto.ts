import { IsPositive, IsUUID } from 'class-validator';

export class GradeSubmissionDto {
  @IsUUID()
  studentId: string;

  @IsPositive()
  grade: number;
}

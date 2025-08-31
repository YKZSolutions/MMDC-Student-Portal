import { IsOptional, IsUUID } from 'class-validator';

export class StudentIdentifierDto {
  @IsOptional()
  @IsUUID('4')
  studentId?: string;
}

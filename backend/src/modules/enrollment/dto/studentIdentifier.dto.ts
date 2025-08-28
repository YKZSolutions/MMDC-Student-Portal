import { IsNotEmpty, IsUUID } from 'class-validator';

export class StudentIdentifierDto {
  @IsNotEmpty()
  @IsUUID('4')
  studentId: string;
}

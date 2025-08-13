import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PromptDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsArray()
  messageHistory: string[];
}

export class UserBaseContextDto {
  @IsString()
  id: string;

  @IsString()
  email: string | null;

  @IsString()
  role: string;
}

export class UserStudentContextDto extends UserBaseContextDto {
  @IsNumber()
  studentNumber: number;
}

export class UserStaffContextDto extends UserBaseContextDto {
  @IsNumber()
  employeeNumber: number;

  @IsString()
  department: string;

  @IsString()
  position: string;
}

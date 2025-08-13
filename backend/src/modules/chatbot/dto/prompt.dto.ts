import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class PromptDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsArray()
  messageHistory: string[];

  @ValidateNested()
  @IsNotEmpty()
  user: UserStudentContextDto | UserStaffContextDto;
}

export class UserBaseContextDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  role: string;
}

export class UserStudentContextDto extends UserBaseContextDto {
  @IsNotEmpty()
  @IsString()
  studentNumber: string;
}

export class UserStaffContextDto extends UserBaseContextDto {
  @IsNotEmpty()
  @IsString()
  employeeNumber: string;

  @IsNotEmpty()
  @IsString()
  department: string;

  @IsNotEmpty()
  @IsString()
  position: string;
}

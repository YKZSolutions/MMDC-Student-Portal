import { IsNumber, IsString } from 'class-validator';

export class UserBaseContext {
  @IsString()
  id: string;

  @IsString()
  email: string | null;

  @IsString()
  role: string;
}

export class UserStudentContext extends UserBaseContext {
  @IsNumber()
  studentNumber: number;
}

export class UserStaffContext extends UserBaseContext {
  @IsNumber()
  employeeNumber: number;

  @IsString()
  department: string;

  @IsString()
  position: string;
}

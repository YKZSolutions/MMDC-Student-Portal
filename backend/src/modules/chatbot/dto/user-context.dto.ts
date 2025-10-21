import { IsNumber, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class UserBaseContext {
  @IsString()
  id: string;

  @IsString()
  email: string | null;

  @IsString()
  name: string | null;

  role: Role;
}

export class UserStudentContext extends UserBaseContext {
  @IsString()
  studentNumber: string;
}

export class UserStaffContext extends UserBaseContext {
  @IsNumber()
  employeeNumber: number;

  @IsString()
  department: string;

  @IsString()
  position: string;
}

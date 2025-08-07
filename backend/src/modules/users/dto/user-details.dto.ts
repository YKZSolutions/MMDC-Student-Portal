import { StaffDetailsDto } from '@/generated/nestjs-dto/staffDetails.dto';
import { StudentDetailsDto } from '@/generated/nestjs-dto/studentDetails.dto';
import { UserDetailsDto } from '@/generated/nestjs-dto/userDetails.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserDetailsFullDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty()
  firstName: string;

  @ApiProperty({ nullable: true })
  middleName: string | null;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ nullable: true, type: UserDetailsDto })
  userDetails: UserDetailsDto | null;
}

export class UserStudentDetailsDto extends UserDetailsFullDto {
  @ApiProperty({ type: StudentDetailsDto, nullable: true })
  studentDetails: StudentDetailsDto;
}

export class UserStaffDetailsDto extends UserDetailsFullDto {
  @ApiProperty({ type: StaffDetailsDto, nullable: true })
  staffDetails: StaffDetailsDto;
}

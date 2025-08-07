import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserDetailsDto {
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

  @ApiProperty({ nullable: true, type: Object })
  userDetails: any;

  @ApiProperty({ nullable: true, type: Object })
  studentDetails: any;

  @ApiProperty({ nullable: true, type: Object })
  staffDetails: any;
}

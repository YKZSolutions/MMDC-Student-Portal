import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class FilterUserDto {
  @ApiProperty()
  search: string;

  @ApiProperty({ enum: Role })
  role: Role;

//   @ApiProperty({ enum: UserAccountStatus })
//   status: UserAccountStatus;
}

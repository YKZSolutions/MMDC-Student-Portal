import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class FilterUserDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  search?: string;

  @ApiProperty({ enum: Role, required: false })
  role?: Role;

  //   @ApiProperty({ enum: UserAccountStatus })
  //   status: UserAccountStatus;
}

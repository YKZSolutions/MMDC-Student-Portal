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

  @ApiProperty({ type: 'number', required: false, default: 1 })
  page?: number;

  //   @ApiProperty({ enum: UserAccountStatus })
  //   status: UserAccountStatus;
}

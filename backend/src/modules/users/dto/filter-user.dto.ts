import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class FilterUserDto extends BaseFilterDto {
  @ApiProperty({ enum: Role, required: false })
  role?: Role;

  //   @ApiProperty({ enum: UserAccountStatus })
  //   status: UserAccountStatus;
}

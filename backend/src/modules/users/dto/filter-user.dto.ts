import { BaseFilterDto } from '@/common/dto/base-filter.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class FilterUserDto extends BaseFilterDto {
  @IsEnum(Role)
  @IsOptional()
  @ApiProperty({ enum: Role, required: false })
  role?: Role;

  //   @ApiProperty({ enum: UserAccountStatus })
  //   status: UserAccountStatus;
}

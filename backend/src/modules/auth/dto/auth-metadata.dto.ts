import { UserMetadata } from '@/common/interfaces/auth.user-metadata';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { $Enums, Role, UserStatus } from '@prisma/client';

export class AuthMetadataDto implements UserMetadata {
  @ApiPropertyOptional({
    enum: Role,
    enumName: 'Role',
  })
  role?: $Enums.Role | undefined;
  @ApiPropertyOptional({
    enum: UserStatus,
    enumName: 'UserStatus',
  })
  status?: $Enums.UserStatus | undefined;
  user_id?: string | undefined;
}

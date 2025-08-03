import { User, UserAccount, UserDetails } from '@/generated/interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class UserWithRelations extends User {
  @ApiProperty({ type: () => UserAccount, nullable: true })
  userAccount: UserAccount | null;

  @ApiProperty({ type: () => UserDetails, nullable: true })
  userDetails: UserDetails | null;
}

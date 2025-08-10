import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { UserAccountDto } from '@/generated/nestjs-dto/userAccount.dto';
import { UserDetailsDto } from '@/generated/nestjs-dto/userDetails.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserWithRelations extends UserDto {
  @ApiProperty({ type: () => UserAccountDto, nullable: true })
  userAccount: UserAccountDto | null;

  @ApiProperty({ type: () => UserDetailsDto, nullable: true })
  userDetails: UserDetailsDto | null;
}

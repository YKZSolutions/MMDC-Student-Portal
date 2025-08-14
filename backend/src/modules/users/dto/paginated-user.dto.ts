import { ApiProperty } from '@nestjs/swagger';
import { UserWithRelations } from './user-with-relations.dto';
import { PaginatedDto } from '@/common/dto/paginated.dto';

export class PaginatedUsersDto extends PaginatedDto<UserWithRelations> {
  @ApiProperty({ type: [UserWithRelations] })
  users: UserWithRelations[];
}

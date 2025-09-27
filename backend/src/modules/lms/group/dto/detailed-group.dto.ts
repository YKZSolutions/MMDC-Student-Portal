import { GroupDto } from '@/generated/nestjs-dto/group.dto';
import { ApiProperty, PickType } from '@nestjs/swagger';

export class StudentInfoDto {
  @ApiProperty({ type: 'string' })
  firstName: string;

  @ApiProperty({ type: 'string' })
  lastName: string;
}

export class GroupMemberDto {
  @ApiProperty({ type: 'string', format: 'uuid' })
  studentId: string;

  @ApiProperty({ type: () => StudentInfoDto })
  student: StudentInfoDto;
}

export class DetailedGroupDto extends PickType(GroupDto, [
  'id',
  'groupNumber',
  'groupName',
]) {
  @ApiProperty({ type: () => [GroupMemberDto] })
  members: GroupMemberDto[];
}

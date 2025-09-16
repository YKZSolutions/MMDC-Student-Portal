import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GroupMemberGroupIdStudentIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  groupId: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  studentId: string;
}

@ApiExtraModels(GroupMemberGroupIdStudentIdUniqueInputDto)
export class ConnectGroupMemberDto {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: GroupMemberGroupIdStudentIdUniqueInputDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GroupMemberGroupIdStudentIdUniqueInputDto)
  groupId_studentId?: GroupMemberGroupIdStudentIdUniqueInputDto;
}

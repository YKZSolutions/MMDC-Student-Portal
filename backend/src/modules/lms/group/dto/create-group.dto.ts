import { CreateGroupDto } from '@/generated/nestjs-dto/create-group.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class CreateDetailedGroupDto extends CreateGroupDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
    description: 'List of student IDs to assign as member',
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  members: string[];
}

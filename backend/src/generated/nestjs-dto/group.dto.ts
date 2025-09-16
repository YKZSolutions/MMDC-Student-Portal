import { ApiProperty } from '@nestjs/swagger';

export class GroupDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  groupNumber: number;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  groupName: string | null;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}

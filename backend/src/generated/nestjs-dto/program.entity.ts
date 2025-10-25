import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Major, type Major as MajorAsType } from './major.entity';

export class Program {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiHideProperty()
  majors?: MajorAsType[];
  @ApiProperty({
    type: 'string',
  })
  programCode: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  description: string | null;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  yearDuration: number;
  @ApiProperty({
    type: 'boolean',
  })
  isActive: boolean;
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
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletedAt: Date | null;
}

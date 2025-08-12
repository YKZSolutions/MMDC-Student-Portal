import { ApiProperty } from '@nestjs/swagger';
import { Major, type Major as MajorAsType } from './major.entity';

export class Course {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => Major,
    isArray: true,
    required: false,
  })
  major?: MajorAsType[];
  @ApiProperty({
    type: () => Course,
    isArray: true,
    required: false,
  })
  prereqs?: Course[];
  @ApiProperty({
    type: () => Course,
    isArray: true,
    required: false,
  })
  prereqFor?: Course[];
  @ApiProperty({
    type: () => Course,
    isArray: true,
    required: false,
  })
  coreqs?: Course[];
  @ApiProperty({
    type: () => Course,
    isArray: true,
    required: false,
  })
  coreqFor?: Course[];
  @ApiProperty({
    type: 'string',
  })
  courseCode: string;
  @ApiProperty({
    type: 'string',
  })
  name: string;
  @ApiProperty({
    type: 'string',
  })
  description: string;
  @ApiProperty({
    type: 'string',
  })
  year: string;
  @ApiProperty({
    type: 'string',
  })
  semester: string;
  @ApiProperty({
    type: 'integer',
    format: 'int32',
  })
  units: number;
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

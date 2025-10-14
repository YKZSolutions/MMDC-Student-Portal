import { Prisma } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class SectionModuleDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
  @ApiProperty({
    type: () => Object,
    isArray: true,
  })
  classMeetings: Prisma.JsonValue[];
}

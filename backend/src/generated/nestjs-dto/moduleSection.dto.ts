import { ApiProperty } from '@nestjs/swagger';

export class ModuleSectionDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;
}

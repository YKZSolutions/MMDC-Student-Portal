import { ApiPropertyOptional } from '@nestjs/swagger';

export class DueFilterDto {
  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  dueDateFrom?: Date;
  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  dueDateTo?: Date;
}

import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

export class CreatedAtFilterDto {
  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  createdAtFrom?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  createdAtTo?: Date;
}

export class UpdatedAtFilterDto {
  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  updatedAtFrom?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  updatedAtTo?: Date;
}

export class DeletedAtFilterDto {
  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  deletedAtFrom?: Date;

  @ApiPropertyOptional({ type: 'string', format: 'date-time' })
  deletedAtTo?: Date;
}

export class AuditFilterDto extends IntersectionType(
  CreatedAtFilterDto,
  UpdatedAtFilterDto,
  DeletedAtFilterDto,
) {}

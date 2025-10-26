import { PaginatedDto } from '@/common/dto/paginated.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ContentType } from '@prisma/client';

export class TodoDto {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    required: true,
  })
  id: string;
  @ApiProperty({
    type: 'string',
    enum: ContentType,
    required: true,
  })
  type: ContentType;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  title: string;
  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  dueDate: Date | null;
  @ApiProperty({
    type: 'string',
    required: true,
  })
  moduleName: string;
}

export class PaginatedTodosDto extends PaginatedDto {
  @ApiProperty({
    type: () => TodoDto,
    isArray: true,
  })
  todos: TodoDto[];
}

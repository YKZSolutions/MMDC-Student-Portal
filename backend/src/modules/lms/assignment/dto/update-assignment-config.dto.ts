import { ApiProperty } from '@nestjs/swagger';
import { UpdateAssignmentDto } from '@/generated/nestjs-dto/update-assignment.dto';

export class UpdateAssignmentConfigDto extends UpdateAssignmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  rubricTemplateId?: string | null;
}

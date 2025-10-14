import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UpdateAssignmentDto } from '@/generated/nestjs-dto/update-assignment.dto';
import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { ContentType } from '@prisma/client';

export class UpdateAssignmentConfigDto extends UpdateAssignmentDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  rubricTemplateId?: string | null;
}

export class UpdateAssignmentItemDto extends IntersectionType(
  UpdateAssignmentConfigDto,
  UpdateModuleContentDto,
) {
  @ApiProperty({
    enum: [ContentType.ASSIGNMENT],
    default: ContentType.ASSIGNMENT,
  })
  declare contentType: 'ASSIGNMENT';
}

import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { UpdateAssignmentDto } from '@/generated/nestjs-dto/update-assignment.dto';
import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { ContentType } from '@prisma/client';

export class UpdateAssignmentItemDto extends IntersectionType(
  UpdateAssignmentDto,
  UpdateModuleContentDto,
) {
  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  gradingId?: string;

  @ApiProperty({
    enum: [ContentType.ASSIGNMENT],
    default: ContentType.ASSIGNMENT,
  })
  declare contentType: 'ASSIGNMENT';

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;
}

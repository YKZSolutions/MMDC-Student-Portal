import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UpdateDiscussionDto } from '@/generated/nestjs-dto/update-discussion.dto';
import { ContentType } from '@prisma/client';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateDiscussionItemDto extends IntersectionType(
  UpdateDiscussionDto,
  UpdateModuleContentDto,
) {
  @ApiProperty({
    enum: [ContentType.DISCUSSION],
    default: ContentType.DISCUSSION,
  })
  declare contentType: 'DISCUSSION';

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;
}

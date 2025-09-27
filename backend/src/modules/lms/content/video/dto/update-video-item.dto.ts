import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { ContentType } from '@prisma/client';
import { IsOptional, IsUUID } from 'class-validator';
import { UpdateVideoDto } from '@/generated/nestjs-dto/update-video.dto';

export class UpdateVideoItemDto extends IntersectionType(
  UpdateVideoDto,
  UpdateModuleContentDto,
) {
  @ApiProperty({
    enum: [ContentType.VIDEO],
    default: ContentType.VIDEO,
  })
  declare contentType: 'VIDEO';

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;
}

import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UpdateExternalUrlDto } from '@/generated/nestjs-dto/update-externalUrl.dto';
import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { ContentType } from '@prisma/client';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateVideoItemDto extends IntersectionType(
  UpdateExternalUrlDto,
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

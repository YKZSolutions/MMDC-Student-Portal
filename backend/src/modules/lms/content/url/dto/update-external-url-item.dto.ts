import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { UpdateExternalUrlDto } from '@/generated/nestjs-dto/update-externalUrl.dto';
import { ContentType } from '@prisma/client';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateExternalUrlItemDto extends IntersectionType(
  UpdateExternalUrlDto,
  UpdateModuleContentDto,
) {
  @ApiProperty({
    enum: [ContentType.URL],
    default: ContentType.URL,
  })
  declare contentType: 'URL';

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;
}

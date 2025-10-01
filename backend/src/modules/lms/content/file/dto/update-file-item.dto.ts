import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { UpdateFileResourceDto } from '@/generated/nestjs-dto/update-fileResource.dto';
import { ContentType } from '@prisma/client';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateFileItemDto extends IntersectionType(
  UpdateFileResourceDto,
  UpdateModuleContentDto,
) {
  @ApiProperty({
    enum: [ContentType.FILE],
    default: ContentType.FILE,
  })
  declare contentType: 'FILE';

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;
}

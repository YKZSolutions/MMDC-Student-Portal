import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { UpdateModuleContentDto } from '@/generated/nestjs-dto/update-moduleContent.dto';
import { UpdateQuizDto } from '@/generated/nestjs-dto/update-quiz.dto';
import { ContentType } from '@prisma/client';

export class UpdateQuizItemDto extends IntersectionType(
  UpdateQuizDto,
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
    enum: [ContentType.QUIZ],
    default: ContentType.QUIZ,
  })
  declare contentType: 'QUIZ';

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  sectionId?: string;
}

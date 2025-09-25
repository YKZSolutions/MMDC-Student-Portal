import { CreateAssignmentDto } from '@/generated/nestjs-dto/create-assignment.dto';
import { CreateDiscussionDto } from '@/generated/nestjs-dto/create-discussion.dto';
import { CreateExternalUrlDto } from '@/generated/nestjs-dto/create-externalUrl.dto';
import { CreateFileResourceDto } from '@/generated/nestjs-dto/create-fileResource.dto';
import { CreateLessonDto } from '@/generated/nestjs-dto/create-lesson.dto';
import { CreateModuleContentDto } from '@/generated/nestjs-dto/create-moduleContent.dto';
import { CreateQuizDto } from '@/generated/nestjs-dto/create-quiz.dto';
import { CreateVideoDto } from '@/generated/nestjs-dto/create-video.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

export class CreateContentDto extends CreateModuleContentDto {
  // @ApiProperty({
  //   type: CreateAssignmentDto,
  //   required: false,
  // })
  // @ValidateNested()
  // @IsOptional()
  // newContent: NewContentDto;

  @ApiProperty({
    type: 'string',
    required: true,
  })
  sectionId: string;

  @ApiProperty({
    type: CreateAssignmentDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateAssignmentDto)
  assignment?: CreateAssignmentDto;

  @ApiProperty({
    type: CreateQuizDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateQuizDto)
  quiz?: CreateQuizDto;

  @ApiProperty({
    type: CreateLessonDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateLessonDto)
  lesson?: CreateLessonDto;

  @ApiProperty({
    type: CreateDiscussionDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateDiscussionDto)
  discussion?: CreateDiscussionDto;

  @ApiProperty({
    type: CreateExternalUrlDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateExternalUrlDto)
  externalUrl?: CreateExternalUrlDto;

  @ApiProperty({
    type: CreateFileResourceDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateFileResourceDto)
  file?: CreateFileResourceDto;

  @ApiProperty({
    type: CreateVideoDto,
    required: false,
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateVideoDto)
  video?: CreateVideoDto;
}

// export type NewContentDto =
//   | CreateAssignmentDto
//   | CreateQuizDto
//   | CreateLessonDto
//   | CreateExternalUrlDto
//   | CreateFileResourceDto
//   | CreateVideoDto;

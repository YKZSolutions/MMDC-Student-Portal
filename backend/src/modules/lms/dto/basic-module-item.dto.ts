import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ModuleContentDto } from '@/generated/nestjs-dto/moduleContent.dto';
import {
  type ContentProgress as ContentProgressAsType,
  ContentProgress,
} from '@/generated/nestjs-dto/contentProgress.entity';
import { LessonDto } from '@/generated/nestjs-dto/lesson.dto';
import { AssignmentDto } from '@/generated/nestjs-dto/assignment.dto';
import { QuizDto } from '@/generated/nestjs-dto/quiz.dto';
import { DiscussionDto } from '@/generated/nestjs-dto/discussion.dto';
import { VideoDto } from '@/generated/nestjs-dto/video.dto';
import { ExternalUrlDto } from '@/generated/nestjs-dto/externalUrl.dto';
import { FileResourceDto } from '@/generated/nestjs-dto/fileResource.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BasicLessonDto extends OmitType(LessonDto, ['content']) {}
export class BasicAssignmentDto extends OmitType(AssignmentDto, ['content']) {}
export class BasicQuizDto extends OmitType(QuizDto, ['content', 'questions']) {}
export class BasicDiscussionDto extends OmitType(DiscussionDto, ['content']) {}
export class BasicVideoDto extends OmitType(VideoDto, ['content']) {}
export class BasicExternalUrlDto extends OmitType(ExternalUrlDto, [
  'content',
]) {}
export class BasicFileResourceDto extends OmitType(FileResourceDto, [
  'content',
]) {}

export class BasicModuleItemDto extends ModuleContentDto {
  @ApiProperty({
    type: () => BasicLessonDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicLessonDto)
  lesson?: BasicLessonDto | null;

  @ApiProperty({
    type: () => BasicAssignmentDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicAssignmentDto)
  assignment?: BasicAssignmentDto | null;

  @ApiProperty({
    type: () => BasicQuizDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicQuizDto)
  quiz?: BasicQuizDto | null;

  @ApiProperty({
    type: () => BasicDiscussionDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicDiscussionDto)
  discussion?: BasicDiscussionDto | null;

  @ApiProperty({
    type: () => BasicVideoDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicVideoDto)
  video?: BasicVideoDto | null;

  @ApiProperty({
    type: () => BasicExternalUrlDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicExternalUrlDto)
  externalUrl?: BasicExternalUrlDto | null;

  @ApiProperty({
    type: () => BasicFileResourceDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => BasicFileResourceDto)
  fileResource?: BasicFileResourceDto | null;

  @ApiProperty({
    type: () => ContentProgress,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContentProgress)
  studentProgress?: ContentProgressAsType[];
}

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

export class BasicModuleItemDto extends ModuleContentDto {
  @ApiProperty({
    type: () => OmitType<LessonDto, 'content'>,
    required: false,
    nullable: true,
  })
  lesson?: Omit<LessonDto, 'content'> | null;
  @ApiProperty({
    type: () => OmitType<AssignmentDto, 'content'>,
    required: false,
    nullable: true,
  })
  assignment?: Omit<AssignmentDto, 'content'> | null;
  @ApiProperty({
    type: () => OmitType<QuizDto, 'content' | 'questions'>,
    required: false,
    nullable: true,
  })
  quiz?: Omit<QuizDto, 'content' | 'questions'> | null;
  @ApiProperty({
    type: () => OmitType<DiscussionDto, 'content'>,
    required: false,
    nullable: true,
  })
  discussion?: Omit<DiscussionDto, 'content'> | null;
  @ApiProperty({
    type: () => OmitType<VideoDto, 'content'>,
    required: false,
    nullable: true,
  })
  video?: Omit<VideoDto, 'content'> | null;
  @ApiProperty({
    type: () => OmitType<ExternalUrlDto, 'content'>,
    required: false,
    nullable: true,
  })
  externalUrl?: Omit<ExternalUrlDto, 'content'> | null;
  @ApiProperty({
    type: () => OmitType<FileResourceDto, 'content'>,
    required: false,
    nullable: true,
  })
  fileResource?: Omit<FileResourceDto, 'content'> | null;
  @ApiProperty({
    type: () => ContentProgress,
    isArray: true,
    required: false,
  })
  studentProgress?: ContentProgressAsType[];
}

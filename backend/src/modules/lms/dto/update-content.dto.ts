import { UpdateLessonItemDto } from '@/modules/lms/content/lesson/dto/update-lesson-item.dto';
import { UpdateQuizItemDto } from '@/modules/lms/content/quiz/dto/update-quiz-item.dto';
import { UpdateDiscussionItemDto } from '@/modules/lms/content/discussion/dto/update-discussion-item.dto';
import { UpdateFileItemDto } from '@/modules/lms/content/file/dto/update-file-item.dto';
import { UpdateExternalUrlItemDto } from '@/modules/lms/content/url/dto/update-external-url-item.dto';
import { UpdateVideoItemDto } from '@/modules/lms/content/video/dto/update-video-item.dto';
import { UpdateAssignmentItemDto } from '@/modules/lms/content/assignment/dto/update-assignment-item.dto';

export type UpdateContentDto =
  | UpdateLessonItemDto
  | UpdateAssignmentItemDto
  | UpdateQuizItemDto
  | UpdateDiscussionItemDto
  | UpdateFileItemDto
  | UpdateExternalUrlItemDto
  | UpdateVideoItemDto;

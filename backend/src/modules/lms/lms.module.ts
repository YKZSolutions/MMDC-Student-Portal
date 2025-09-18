import { Module } from '@nestjs/common';
import { LmsService } from '@/modules/lms/lms.service';
import { LmsController } from '@/modules/lms/lms.controller';
import { LmsContentController } from '@/modules/lms/lms-content.controller';
import { LmsSectionController } from '@/modules/lms/lms-section.controller';
import { LmsSectionService } from '@/modules/lms/lms-section.service';
import { LmsContentService } from '@/modules/lms/lms-content.service';
import { LmsPublishService } from '@/modules/lms/lms-publish.service';
import { AssignmentService } from '@/modules/lms/content/assignment/assignment.service';
import { AssignmentSubmissionService } from '@/modules/lms/content/assignment/assignment-submission.service';
import { QuizService } from '@/modules/lms/content/quiz/quiz.service';
import { QuizSubmissionService } from '@/modules/lms/content/quiz/quiz-submission.service';
import { DiscussionService } from '@/modules/lms/content/discussion/discussion.service';
import { FileService } from '@/modules/lms/content/file/file.service';
import { LessonService } from '@/modules/lms/content/lesson/lessson.service';
import { UrlService } from '@/modules/lms/content/url/url.service';
import { VideoService } from '@/modules/lms/content/video/video.service';
import { GroupModule } from './group/group.module';

@Module({
  controllers: [LmsController, LmsSectionController, LmsContentController],
  providers: [
    LmsService,
    LmsSectionService,
    LmsContentService,
    LmsPublishService,
    AssignmentService,
    AssignmentSubmissionService,
    QuizService,
    QuizSubmissionService,
    DiscussionService,
    FileService,
    LessonService,
    UrlService,
    VideoService,
  ],
  exports: [
    LmsService,
    LmsSectionService,
    LmsContentService,
    LmsPublishService,
    AssignmentService,
    AssignmentSubmissionService,
    QuizService,
    QuizSubmissionService,
    DiscussionService,
    FileService,
    LessonService,
    UrlService,
    VideoService,
  ],
  imports: [GroupModule],
})
export class LmsModule {}

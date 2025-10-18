import { Module } from '@nestjs/common';
import { LmsContentService } from '@/modules/lms/lms-content/lms-content.service';
import { AssignmentService } from '@/modules/lms/assignment/assignment.service';
import { LmsContentController } from '@/modules/lms/lms-content/lms-content.controller';
import { LmsPublishService } from '@/modules/lms/publish/lms-publish.service';

@Module({
  controllers: [LmsContentController],
  providers: [LmsContentService, AssignmentService, LmsPublishService],
  exports: [LmsContentService],
})
export class LmsContentModule {}

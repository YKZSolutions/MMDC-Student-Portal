import { Module } from '@nestjs/common';
import { AssignmentService } from '@/modules/lms/assignment/assignment.service';
import { AssignmentController } from '@/modules/lms/assignment/assignment.controller';
import { AssignmentSubmissionService } from '@/modules/lms/assignment/assignment-submission.service';

@Module({
  controllers: [AssignmentController],
  providers: [AssignmentService, AssignmentSubmissionService],
  exports: [AssignmentService, AssignmentSubmissionService],
})
export class AssignmentModule {}

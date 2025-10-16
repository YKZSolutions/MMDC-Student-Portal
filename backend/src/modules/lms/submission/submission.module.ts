import { Module } from '@nestjs/common';
import { NotificationsModule } from '../../notifications/notifications.module';
import { SubmissionController } from '@/modules/lms/submission/submission.controller';
import { SubmissionService } from '@/modules/lms/submission/submission.service';

@Module({
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
  imports: [NotificationsModule],
})
export class SubmissionModule {}

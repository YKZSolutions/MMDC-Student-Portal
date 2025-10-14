import { Module } from '@nestjs/common';
import { LmsService } from '@/modules/lms/lms-module/lms.service';
import { LmsController } from '@/modules/lms/lms-module/lms.controller';
import { LmsPublishService } from '@/modules/lms/publish/lms-publish.service';
import { GroupModule } from '../group/group.module';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({
  controllers: [LmsController],
  providers: [LmsService, LmsPublishService],
  exports: [LmsService],
  imports: [GroupModule, NotificationsModule],
})
export class LmsModule {}

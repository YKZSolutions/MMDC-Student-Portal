import { Module } from '@nestjs/common';
import { LmsService } from '@/modules/lms/lms-module/lms.service';
import { LmsController } from '@/modules/lms/lms-module/lms.controller';
import { LmsPublishService } from '@/modules/lms/publish/lms-publish.service';
import { GroupModule } from '../group/group.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { ModuleProgressService } from '@/modules/lms/lms-module/module-progress.service';
import { StudentsModule } from '@/modules/lms/students/students.module';

@Module({
  controllers: [LmsController],
  providers: [LmsService, LmsPublishService, ModuleProgressService],
  exports: [LmsService, ModuleProgressService],
  imports: [GroupModule, NotificationsModule, StudentsModule],
})
export class LmsModule {}

import { Module } from '@nestjs/common';
import { LmsPublishService } from '@/modules/lms/publish/lms-publish.service';
import { LmsSectionController } from '@/modules/lms/lms-section/lms-section.controller';
import { LmsSectionService } from '@/modules/lms/lms-section/lms-section.service';

@Module({
  controllers: [LmsSectionController],
  providers: [LmsSectionService, LmsPublishService],
  exports: [LmsSectionService],
})
export class LmsSectionModule {}

import { Module } from '@nestjs/common';
import { LmsService } from '@/modules/lms/lms.service';
import { LmsController } from '@/modules/lms/lms.controller';
import { LmsContentController } from '@/modules/lms/lms-content.controller';
import { LmsSectionController } from '@/modules/lms/lms-section.controller';
import { LmsSectionService } from '@/modules/lms/lms-section.service';
import { LmsContentService } from '@/modules/lms/lms-content.service';

@Module({
  controllers: [LmsController, LmsSectionController, LmsContentController],
  providers: [LmsService, LmsSectionService, LmsContentService],
  exports: [LmsService, LmsSectionService, LmsContentService],
})
export class LmsModule {}

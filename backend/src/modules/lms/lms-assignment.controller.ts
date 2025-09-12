import { Controller } from '@nestjs/common';
import { LmsContentService } from '@/modules/lms/lms-content.service';

@Controller('lms-assignment')
export class LmsAssignmentController {
  constructor(readonly lmsContentService: LmsContentService) {}
}

import { Controller } from '@nestjs/common';
import { LmsContentService } from '@/modules/lms/lms-content.service';

@Controller('modules')
export class LmsContentController {
  constructor(private readonly lmsContentService: LmsContentService) {}
}

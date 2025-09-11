import { Controller } from '@nestjs/common';
import { LmsSectionService } from '@/modules/lms/lms-section.service';

@Controller('lmsContent')
export class LmsSectionController {
  constructor(private readonly lmsSectionService: LmsSectionService) {}
}

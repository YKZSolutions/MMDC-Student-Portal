import { Controller } from '@nestjs/common';
import { LmsSectionService } from '@/modules/lms/lms-section.service';

@Controller('lms/:lmsId/sections')
export class LmsSectionController {
  constructor(private readonly lmsSectionService: LmsSectionService) {}
}

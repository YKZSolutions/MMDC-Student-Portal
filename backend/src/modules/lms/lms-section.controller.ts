import { Controller } from '@nestjs/common';
import { LmsSectionService } from '@/modules/lms/lms-section.service';

@Controller('modules')
export class LmsSectionController {
  constructor(private readonly lmsSectionService: LmsSectionService) {}
}

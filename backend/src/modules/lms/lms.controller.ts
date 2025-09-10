import { Controller } from '@nestjs/common';
import { LmsService } from '@/modules/lms/lms.service';

@Controller('modules')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}
}

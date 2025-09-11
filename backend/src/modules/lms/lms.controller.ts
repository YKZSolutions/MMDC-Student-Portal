import { Controller } from '@nestjs/common';
import { LmsService } from '@/modules/lms/lms.service';

@Controller('lmsController')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}
}

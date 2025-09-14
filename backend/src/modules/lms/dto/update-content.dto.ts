import { PartialType } from '@nestjs/swagger';
import { CreateContentDto } from '@/modules/lms/dto/create-content.dto';

export class UpdateContentDto extends PartialType(CreateContentDto) {}

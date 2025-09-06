import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseSectionFullDto } from './create-course-section.dto';

export class UpdateCourseSectionDto extends PartialType(
  CreateCourseSectionFullDto,
) {}

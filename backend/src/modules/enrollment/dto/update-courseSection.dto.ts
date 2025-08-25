import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseSectionFullDto } from './create-courseSection.dto';

export class UpdateCourseSectionDto extends PartialType(
  CreateCourseSectionFullDto,
) {}

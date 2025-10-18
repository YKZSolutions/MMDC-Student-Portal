import { PartialType } from '@nestjs/swagger';
import { CreateCourseFullDto } from './create-course-full.dto';

export class UpdateCourseDto extends PartialType(CreateCourseFullDto) {}

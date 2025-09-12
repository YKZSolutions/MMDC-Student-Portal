import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCourseOfferingCurriculumDto {
  @IsNotEmpty()
  @IsUUID()
  curriculumId: string;
}

import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateCourseOfferingDto {
  @IsNotEmpty()
  @IsUUID()
  courseId: string;
}

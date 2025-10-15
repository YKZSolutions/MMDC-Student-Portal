import { CourseDto } from '@/generated/nestjs-dto/course.dto';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { TranscriptDto } from '@/generated/nestjs-dto/transcript.dto';
import { ApiProperty } from '@nestjs/swagger';

class TranscriptCourseOfferingDto {
  course: CourseDto;
  enrollmentPeriod: EnrollmentPeriodDto;
}

export class DetailedTranscriptDto extends TranscriptDto {
  @ApiProperty({ type: () => TranscriptCourseOfferingDto })
  courseOffering: TranscriptCourseOfferingDto;
}

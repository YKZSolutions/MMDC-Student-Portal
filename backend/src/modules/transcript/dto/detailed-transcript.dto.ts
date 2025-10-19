import { CourseDto } from '@/generated/nestjs-dto/course.dto';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { TranscriptDto } from '@/generated/nestjs-dto/transcript.dto';
import { UserWithRelations } from '@/modules/users/dto/user-with-relations.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/library';

class TranscriptCourseOfferingDto {
  course: CourseDto;
  enrollmentPeriod: EnrollmentPeriodDto;
}

export class DetailedTranscriptDto extends TranscriptDto {
  @ApiProperty({ type: () => TranscriptCourseOfferingDto })
  courseOffering: TranscriptCourseOfferingDto;

  @ApiProperty({ type: 'string', format: 'uuid' })
  courseOfferingId: string;

  @ApiProperty({ type: () => UserWithRelations })
  user: UserWithRelations;

  @ApiProperty({
    type: 'string',
    format: 'Decimal.js',
    required: false,
  })
  gwa?: Decimal;
}

import { PaginatedDto } from '@/common/dto/paginated.dto';
import { UserDto } from '@/generated/nestjs-dto/user.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { DetailedCourseEnrollmentDto } from './detailed-course-enrollment.dto';

export class PaginatedCourseEnrollmentsDto extends PaginatedDto {
  @ApiProperty({
    type: () => CustomDetailedCourseEnrollmentDto,
    isArray: true,
    description: 'List of course enrollments for the current page',
  })
  enrollments: CustomDetailedCourseEnrollmentDto[];
}

class StudentDto extends OmitType(UserDto, [
  'createdAt',
  'updatedAt',
  'deletedAt',
  'disabledAt',
] as const) {}

class CustomDetailedCourseEnrollmentDto extends DetailedCourseEnrollmentDto {
  student: StudentDto;
}

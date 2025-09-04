import { PaginatedDto } from '@/common/dto/paginated.dto';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedEnrollmentPeriodsDto extends PaginatedDto {
  @ApiProperty({
    type: () => EnrollmentPeriodDto,
    isArray: true,
    description: 'List of enrollment periods for the current page',
  })
  enrollments: EnrollmentPeriodDto[];
}

import { PaginatedDto } from '@/common/dto/paginated.dto';
import { EnrollmentPeriodDto } from '@/generated/nestjs-dto/enrollmentPeriod.dto';
import { ModuleDto } from '@/generated/nestjs-dto/module.dto';
import { DetailedCourseOfferingDto } from '@/modules/enrollment/dto/paginated-course-offering.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';

// Omit courseEnrollments for a lighter course offering representation in modules
export class CustomDetailedCourseOfferingDto extends OmitType(
  DetailedCourseOfferingDto,
  ['courseEnrollments'],
) {
  enrollmentPeriod?: EnrollmentPeriodDto | null;
}

// Module DTO with optional course offering details
export class DetailedModulesDto extends ModuleDto {
  courseOffering: CustomDetailedCourseOfferingDto | null;
}

// Paginated response for modules
export class PaginatedModulesDto extends PaginatedDto {
  @ApiProperty({
    type: () => DetailedModulesDto,
    isArray: true,
  })
  modules: DetailedModulesDto[];
}

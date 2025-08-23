import { PaginatedDto } from '@/common/dto/paginated.dto';
import { CourseOfferingDto } from '@/generated/nestjs-dto/courseOffering.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedCourseOfferingsDto extends PaginatedDto {
  @ApiProperty({
    type: () => CourseOfferingDto,
    isArray: true,
    description: 'List of course offerings for the current page',
  })
  courseOfferings: CourseOfferingDto[];
}

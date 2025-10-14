import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { CourseOfferingService } from './course-offering.service';
import { CourseSectionService } from './course-section.service';
import { CourseOfferingController } from './course-offering.controller';
import { CourseSectionController } from './course-section.controller';
import { CourseEnrollmentService } from './course-enrollment.service';
import { CourseEnrollmentController } from './course-enrollment.controller';
import { BillingModule } from '../billing/billing.module';
import { LmsModule } from '../lms/lms.module';

@Module({
  controllers: [
    EnrollmentController,
    CourseOfferingController,
    CourseSectionController,
    CourseEnrollmentController,
  ],
  providers: [
    EnrollmentService,
    CourseOfferingService,
    CourseSectionService,
    CourseEnrollmentService,
  ],
  exports: [EnrollmentService, CourseEnrollmentService],
  imports: [BillingModule, LmsModule],
})
export class EnrollmentModule {}

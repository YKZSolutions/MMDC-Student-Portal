import { Module } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentController } from './enrollment.controller';
import { CourseOfferingService } from './courseOffering.service';
import { CourseSectionService } from './courseSection.service';
import { CourseOfferingController } from './courseOffering.controller';
import { CourseSectionController } from './courseSection.controller';
import { CourseEnrollmentService } from './courseEnrollment.service';
import { CourseEnrollmentController } from './courseEnrollment.controller';

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
})
export class EnrollmentModule {}

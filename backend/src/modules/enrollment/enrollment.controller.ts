import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentPeriodDto } from '@/generated/nestjs-dto/create-enrollmentPeriod.dto';
import { Public } from '@/common/decorators/auth.decorator';
import { StatusBypass } from '@/common/decorators/user-status.decorator';
import { CreateCourseOfferingDto } from './dto/create-courseOffering.dto';
import { CreateCourseSectionFullDto } from './dto/create-courseSection.dto';
import { UpdateCourseSection } from './dto/update-courseSection.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollmentStatus.dto';

@Public()
@StatusBypass()
@Controller('enrollment')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  createEnrollment(@Body() dto: CreateEnrollmentPeriodDto) {
    return this.enrollmentService.createEnrollment(dto);
  }

  @Post('/:periodId/offerings')
  createCourseOffering(
    @Param('periodId') periodId: string,
    @Body() dto: CreateCourseOfferingDto,
  ) {
    return this.enrollmentService.createCourseOffering(periodId, dto);
  }

  @Post('/offerings/:offeringId/sections')
  createCourseSection(
    @Param('offeringId') offeringId: string,
    @Body() dto: CreateCourseSectionFullDto,
  ) {
    return this.enrollmentService.createCourseSection(offeringId, dto);
  }

  @Get()
  findAllEnrollments() {
    return this.enrollmentService.findAllEnrollments();
  }

  @Get('/offerings')
  findAllCourseOfferings() {
    return this.enrollmentService.findAllCourseOfferings();
  }

  @Get(':id')
  findOneEnrollment(@Param('id') id: string) {
    return this.enrollmentService.findOneEnrollment(id);
  }

  @Get('/offerings/:offeringId')
  findOneCourseOffering(@Param('offeringId') offeringId: string) {
    return this.enrollmentService.findOneCourseOffering(offeringId);
  }

  @Get('/offerings/:offeringId/sections/:sectionId')
  findOneCourseSection(
    @Param('offeringId') offeringId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.enrollmentService.findOneCourseSection(offeringId, sectionId);
  }

  @Patch('/:id/status')
  updateEnrollmentStatus(
    @Param('id') id: string,
    @Body() updateEnrollmentStatusDto: UpdateEnrollmentStatusDto,
  ) {
    return this.enrollmentService.updateEnrollmentStatus(
      id,
      updateEnrollmentStatusDto,
    );
  }

  @Patch(':id')
  updateEnrollment(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.updateEnrollment(id, updateEnrollmentDto);
  }

  @Patch('/offerings/:offeringId/sections/:sectionId')
  updateCourseSection(
    @Param('offeringId') offeringId: string,
    @Param('sectionId') sectionId: string,
    @Body() updateCourseSectionDto: UpdateCourseSection,
  ) {
    return this.enrollmentService.updateCourseSection(
      offeringId,
      sectionId,
      updateCourseSectionDto,
    );
  }

  @Delete(':id')
  removeEnrollment(@Param('id') id: string) {
    return this.enrollmentService.removeEnrollment(id);
  }

  @Delete(':periodId/offerings/:offeringId')
  removeCourseOffering(
    @Param('periodId') periodId: string,
    @Param('offeringId') offeringId: string,
  ) {
    return this.enrollmentService.removeCourseOffering(periodId, offeringId);
  }

  @Delete('offerings/:offeringId/sections/:sectionId')
  removeCourseSection(
    @Param('offeringId') offeringId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.enrollmentService.removeCourseSection(offeringId, sectionId);
  }
}

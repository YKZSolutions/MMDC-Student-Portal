import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { SubmissionService } from './submission.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums/roles.enum';
import { GradeSubmissionDto } from './dto/grade-submission.dto';

@Controller('modules/:moduleId/submissions')
export class SubmissionController {
  constructor(private readonly lmsAssignmentService: SubmissionService) {}

  @Patch(':submissionId')
  @Roles(Role.MENTOR)
  @ApiException(() => [InternalServerErrorException])
  grade(
    @Param('submissionId') submissionId: string,
    @Body() gradeDto: GradeSubmissionDto,
  ) {
    return this.lmsAssignmentService.grade(submissionId, gradeDto);
  }

  @Get(':submissionId')
  @Roles(Role.MENTOR)
  @ApiException(() => [InternalServerErrorException])
  findOne(@Param('submissionId') submissionId: string) {
    return this.lmsAssignmentService.findOne(submissionId);
  }
}

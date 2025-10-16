import { Module } from '@nestjs/common';
import { AssignmentService } from '@/modules/lms/assignment/assignment.service';
import { AssignmentController } from '@/modules/lms/assignment/assignment.controller';

@Module({
  controllers: [AssignmentController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}

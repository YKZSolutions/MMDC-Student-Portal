import { Module } from '@nestjs/common';
import { AssignmentService } from '@/modules/lms/assignment/assignment.service';
import { AssignmentController } from '@/modules/lms/assignment/assignment.controller';
import { TasksController } from '@/modules/lms/assignment/tasks.controller';

@Module({
  controllers: [AssignmentController, TasksController],
  providers: [AssignmentService],
  exports: [AssignmentService],
})
export class AssignmentModule {}

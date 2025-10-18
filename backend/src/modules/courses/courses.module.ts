import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { LmsModule } from '../lms/lms-module/lms.module';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
  imports: [LmsModule],
})
export class CoursesModule {}

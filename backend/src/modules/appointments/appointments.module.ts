import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { UsersModule } from '../users/users.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  imports: [UsersModule, EnrollmentModule],
})
export class AppointmentsModule {}

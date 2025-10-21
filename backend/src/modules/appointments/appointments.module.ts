import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { UsersModule } from '../users/users.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  imports: [UsersModule, EnrollmentModule, NotificationsModule],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}

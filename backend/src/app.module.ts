import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CustomPrismaModule } from 'nestjs-prisma';
import { AuthGuard } from './common/guards/auth.guard';
import { RoleGuard } from './common/guards/role.guard';
import { EnvConfigModule } from './config/config.module';
import { extendedPrismaClient } from './lib/prisma/prisma.extension';
import { SupabaseModule } from './lib/supabase/supabase.module';
import { CoursesModule } from './modules/courses/courses.module';
import { TestModule } from './modules/test/test.module';
import { UsersModule } from './modules/users/users.module';
import { UserStatusGuard } from './common/guards/user-status.guard';
import { AuthModule } from './modules/auth/auth.module';
import { BillingModule } from './modules/billing/billing.module';
import { RequestIdMiddleware } from '@/middleware/request-id.middleware';
import { ChatbotModule } from '@/modules/chatbot/chatbot.module';
import { ProgramModule } from './modules/program/program.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { MajorModule } from './modules/major/major.module';
import { InstallmentModule } from './modules/installment/installment.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { SwaggerModule } from './modules/swagger/swagger.module';
import { LmsModule } from '@/modules/lms/lms-module/lms.module';
import { PricingModule } from '@/modules/pricing/pricing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { LmsContentModule } from '@/modules/lms/lms-content/lms-content.module';
import { LmsSectionModule } from '@/modules/lms/lms-section/lms-section.module';
import { AssignmentModule } from '@/modules/lms/assignment/assignment.module';
import { GroupModule } from '@/modules/lms/group/group.module';
import { SubmissionModule } from '@/modules/lms/submission/submission.module';

@Module({
  imports: [
    EnvConfigModule,
    CustomPrismaModule.forRootAsync({
      isGlobal: true,
      name: 'PrismaService',
      useFactory: () => {
        return extendedPrismaClient;
      },
    }),
    SupabaseModule,
    TestModule,
    UsersModule,
    CoursesModule,
    AuthModule,
    BillingModule,
    PaymentsModule,
    ProgramModule,
    ChatbotModule,
    MajorModule,
    InstallmentModule,
    EnrollmentModule,
    CurriculumModule,
    GroupModule,
    AssignmentModule,
    LmsModule,
    LmsSectionModule,
    LmsContentModule,
    SubmissionModule,
    SwaggerModule,
    PricingModule,
    NotificationsModule,
    AppointmentsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useExisting: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: UserStatusGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: RoleGuard,
    },
    AuthGuard,
    UserStatusGuard,
    RoleGuard,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}

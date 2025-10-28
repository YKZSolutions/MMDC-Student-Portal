import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { GeminiService } from '@/lib/gemini/gemini.service';
import { UsersModule } from '../users/users.module';
import { BillingModule } from '../billing/billing.module';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import { N8nService } from '@/lib/n8n/n8n.service';
import { HttpModule } from '@nestjs/axios';
import { AppointmentsModule } from '@/modules/appointments/appointments.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { LmsModule } from '@/modules/lms/lms-module/lms.module';
import { VectorSearchService } from '@/modules/chatbot/vector-search.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    AppointmentsModule,
    UsersModule,
    BillingModule,
    CoursesModule,
    EnrollmentModule,
    LmsModule,
    NotificationsModule,
    HttpModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 3600, // 1 hour default
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [ChatbotController],
  providers: [
    ChatbotService,
    GeminiService,
    SupabaseService,
    N8nService,
    VectorSearchService,
  ],
})
export class ChatbotModule {}

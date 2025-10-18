import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { GeminiService } from '@/lib/gemini/gemini.service';
import { UsersModule } from '../users/users.module';
import { BillingModule } from '../billing/billing.module';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { LmsModule } from '../lms/lms-module/lms.module';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import { N8nService } from '@/lib/n8n/n8n.service';
import { HttpModule } from '@nestjs/axios';
import { LmsContentModule } from '@/modules/lms/lms-content/lms-content.module';

@Module({
  imports: [
    UsersModule,
    BillingModule,
    CoursesModule,
    EnrollmentModule,
    LmsModule,
    LmsContentModule,
    HttpModule,
  ],
  controllers: [ChatbotController],
  providers: [ChatbotService, GeminiService, SupabaseService, N8nService],
})
export class ChatbotModule {}

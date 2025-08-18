import { Module } from '@nestjs/common';
import { ChatbotController } from '@/modules/chatbot/chatbot.controller';
import { ChatbotService } from '@/modules/chatbot/chatbot.service';
import { GeminiService } from '@/lib/gemini/gemini.service';
import { UsersModule } from '@/modules/users/users.module';
import { BillingModule } from '@/modules/billing/billing.module';
import { CoursesModule } from '@/modules/courses/courses.module';
import { SupabaseService } from '@/lib/supabase/supabase.service';
import { N8nService } from '@/lib/n8n/n8n.service';

@Module({
  imports: [UsersModule, BillingModule, CoursesModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, GeminiService, SupabaseService, N8nService],
})
export class ChatbotModule {}

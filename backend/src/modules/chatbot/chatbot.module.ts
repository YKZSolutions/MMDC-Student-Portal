import { Module } from '@nestjs/common';
import { ChatbotController } from '@/modules/chatbot/chatbot.controller';
import { ChatbotService } from '@/modules/chatbot/chatbot.service';
import { GeminiService } from '@/lib/gemini/gemini.service';
import { GeminiSessionStore } from '@/lib/gemini/gemini-session.store';
import { UsersModule } from '@/modules/users/users.module';
import { BillingModule } from '@/modules/billing/billing.module';
import { CoursesModule } from '@/modules/courses/courses.module';
import { SupabaseService } from '@/lib/supabase/supabase.service';

@Module({
  imports: [UsersModule, BillingModule, CoursesModule],
  controllers: [ChatbotController],
  providers: [
    ChatbotService,
    GeminiService,
    GeminiSessionStore,
    SupabaseService,
  ],
})
export class ChatbotModule {}

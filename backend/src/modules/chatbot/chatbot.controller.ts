import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ChatbotService } from '@/modules/chatbot/chatbot.service';
import { PromptDto } from '@/modules/chatbot/dto/prompt.dto';
import { CurrentUser } from '@/common/decorators/auth-user.decorator';
import { AuthUser } from '@supabase/supabase-js';
import { Role } from '@/common/enums/roles.enum';

@ApiBearerAuth()
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async prompt(@CurrentUser() user: AuthUser, @Body() prompt: PromptDto) {
    return this.chatbotService.handleQuestion(
      user.id,
      user.user_metadata.role as Role,
      prompt,
    );
  }
}

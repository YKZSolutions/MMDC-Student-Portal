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
import { Public } from '@/common/decorators/auth.decorator';
import { PromptDto } from '@/modules/chatbot/dto/prompt.dto';

@ApiBearerAuth()
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @Public()
  @ApiException(() => BadRequestException)
  @ApiException(() => InternalServerErrorException)
  async prompt(@Body() prompt: PromptDto) {
    return this.chatbotService.handleQuestion(prompt);
  }
}

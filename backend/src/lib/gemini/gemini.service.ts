import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { getToolsForRole } from '@/lib/gemini/function-declarations';
import { GeminiSessionStore } from '@/lib/gemini/gemini-session.store';
import {
  UserBaseContextDto,
  UserStaffContextDto,
  UserStudentContextDto,
} from '@/modules/chatbot/dto/prompt.dto';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly gemini: GoogleGenAI;
  private readonly model: string = 'gemini-2.5-flash';

  constructor(private sessionStore: GeminiSessionStore) {
    this.gemini = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  /**
   * Ask Gemini a question and let it decide if it should call a function.
   */
  async askWithFunctionCalling(
    question: string,
    currentUser:
      | UserBaseContextDto
      | UserStudentContextDto
      | UserStaffContextDto,
  ) {
    this.logger.debug(`Asking Gemini: ${question}`);

    console.log('Current user', currentUser);

    //TODO: remove this when session store is implemented in the client
    const session = this.sessionStore.createOrUpdateSession(currentUser);

    const role = currentUser.role ?? 'user';
    const allowedTools = getToolsForRole(role);

    const systemContext = currentUser
      ? `The current authenticated user is: ${JSON.stringify(currentUser)}`
      : `No authenticated user.`;

    const conversation = [
      { role: 'model', parts: [{ text: systemContext }] },
      ...session.history,
      { role: 'user', parts: [{ text: question }] },
    ];

    const result = await this.gemini.models.generateContent({
      model: this.model,
      contents: conversation,
      config: { tools: allowedTools },
    });

    // Store user message + bot response in history
    //TODO: remove this when session store is implemented in the client
    this.sessionStore.appendMessage(currentUser.id, 'user', question);
    if (result.text) {
      this.sessionStore.appendMessage(currentUser.id, 'model', result.text);
    }

    return {
      text: result.text,
      call: result.functionCalls ?? null,
    };
  }

  /**
   * Generate an embedding for vector search.
   */
  async generateEmbedding(text: string) {
    this.logger.debug(`Generating embedding for: ${text}`);

    const result = await this.gemini.models.embedContent({
      model: 'gemini-embedding-001',
      contents: [{ role: 'user', parts: [{ text }] }],
    });

    return result.embeddings;
  }

  /**
   * Generate final natural language answer with context.
   */
  async generateFinalAnswer(question: string, context: any) {
    const prompt = `
      Question: ${question}
      Context: ${typeof context === 'string' ? context : JSON.stringify(context)}
    `;

    const result = await this.gemini.models.generateContent({
      model: this.model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    return result.text;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { getToolsForRole } from '@/lib/gemini/function-declarations';
import {
  UserStaffDetailsDto,
  UserStudentDetailsDto,
} from '@/modules/users/dto/user-details.dto';
import { GeminiSessionStore } from '@/lib/gemini/gemini-session.store';

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
    sessionId: string,
    question: string,
    currentUser?: UserStaffDetailsDto | UserStudentDetailsDto,
  ) {
    this.logger.debug(`Asking Gemini: ${question}`);

    const session = this.sessionStore.createOrUpdateSession(
      sessionId,
      currentUser,
    );

    const role = currentUser?.role ?? 'user';
    const allowedTools = getToolsForRole(role);

    const systemContext = currentUser
      ? `The current authenticated user is: ${JSON.stringify(currentUser)}`
      : `No authenticated user.`;

    const conversation = [
      { role: 'system', parts: [{ text: systemContext }] },
      ...session.history,
      { role: 'user', parts: [{ text: question }] },
    ];

    const result = await this.gemini.models.generateContent({
      model: this.model,
      contents: conversation,
      config: { tools: allowedTools },
    });

    // Store user message + bot response in history
    this.sessionStore.appendMessage(sessionId, 'user', question);
    if (result.text) {
      this.sessionStore.appendMessage(sessionId, 'model', result.text);
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

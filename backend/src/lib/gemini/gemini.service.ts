import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { getToolsForRole } from '@/lib/gemini/function-declarations';
import {
  UserBaseContext,
  UserStaffContext,
  UserStudentContext,
} from '@/modules/chatbot/dto/user-context.dto';
import { Turn } from '@/modules/chatbot/dto/prompt.dto';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly gemini: GoogleGenAI;
  private readonly model: string = 'gemini-2.5-flash';

  constructor() {
    this.gemini = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  /**
   * Ask Gemini a question and let it decide if it should call a function.
   */
  async askWithFunctionCalling(
    question: string,
    sessionHistory: Turn[],
    currentUser: UserBaseContext | UserStudentContext | UserStaffContext,
  ) {
    const method = 'askWithFunctionCalling';
    this.logger.log(`[${method}] START: question=${question}`);
    this.logger.debug(`Asking Gemini: ${question}`);
    this.logger.debug('Current user', currentUser);
    this.logger.debug('Session history', sessionHistory);

    const role = currentUser.role ?? 'user';
    const allowedTools = getToolsForRole(role);

    const systemContext = currentUser
      ? `The current authenticated user is: ${JSON.stringify(currentUser)}`
      : `No authenticated user.`;

    // Convert session history to the format expected by Gemini
    const history = (sessionHistory ?? []).map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.content }],
    }));

    // Create the conversation with system context and current question
    const conversation = [{ role: 'model', parts: [{ text: systemContext }] }];

    if (history.length > 0) {
      conversation.push(...history);
    }

    conversation.push({ role: 'user', parts: [{ text: question }] });

    try {
      const result = await this.gemini.models.generateContent({
        model: this.model,
        contents: conversation,
        config: { tools: allowedTools },
      });

      this.logger.log(
        `[${method}] SUCCESS: userId=${currentUser.id} role=${role}`,
      );

      // Extract the response text
      const responseText = result.text;

      // Extract function calls if any
      const functionCalls = result.functionCalls;

      return {
        text: responseText,
        call: functionCalls?.length ? functionCalls : null,
      };
    } catch (error) {
      this.logger.error(`[${method}] Error calling Gemini API:`, error);
      throw new Error('Failed to get response from Gemini API');
    }
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

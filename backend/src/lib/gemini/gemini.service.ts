import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly gemini: GoogleGenAI;

  constructor() {
    this.gemini = new GoogleGenAI({});
  }

  getClient() {
    return this.gemini;
  }

  async generateText(prompt: string) {
    const response = await this.gemini.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    return response.text;
  }

  async generateDocumentEmbeddings(content: string[]) {
    const response = await this.gemini.models.embedContent({
      model: 'gemini-embedding-001',
      contents: content,
      config: {
        taskType: 'QUESTION_ANSWERING',
      },
    });

    return response.embeddings;
  }
}

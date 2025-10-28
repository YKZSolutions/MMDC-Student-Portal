import { Injectable } from '@nestjs/common';
import { getToolsForRole } from '@/lib/gemini/function-declarations';
import {
  UserBaseContext,
  UserStaffContext,
  UserStudentContext,
} from '@/modules/chatbot/dto/user-context.dto';
import { Turn } from '@/modules/chatbot/dto/prompt.dto';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from '@/config/env.schema';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  ContentEmbedding,
  ContentListUnion,
  FunctionCall,
  GoogleGenAI,
} from '@google/genai';

@Injectable()
export class GeminiService {
  private readonly gemini: GoogleGenAI;
  private readonly model: string = 'gemini-2.5-flash-lite';
  private readonly embeddingModel: string = 'text-embedding-004';

  constructor(private readonly configService: ConfigService<EnvVars>) {
    this.gemini = new GoogleGenAI({
      apiKey: this.configService.get('GEMINI_API_KEY'),
    });
  }

  /**
   * Generate embeddings for text using Gemini's embedding model
   */
  @Log({
    logArgsMessage: ({ text }) =>
      `Generate embedding for text length=${text.length}`,
    logSuccessMessage: () => `Successfully generated embedding`,
    logErrorMessage: (err) =>
      `Failed to generate embedding | Error=${err.message}`,
  })
  async generateEmbedding(
    @LogParam('text') text: string[],
  ): Promise<ContentEmbedding[]> {
    const result = await this.gemini.models.embedContent({
      model: this.embeddingModel,
      contents: text,
    });

    if (result.embeddings) return result.embeddings;
    throw new Error('No embeddings found in the response');
  }

  /**
   * Ask Gemini a question and let it decide if it should call a function.
   */
  @Log({
    logArgsMessage: ({ question, currentUser, sessionHistory }) =>
      `Ask Gemini with function calling question="${question}" sessionHistory=${sessionHistory} userId=${currentUser?.id} role=${currentUser?.role}`,
    logSuccessMessage: (_, { currentUser }) =>
      `Gemini responded successfully for userId=${currentUser?.id} role=${currentUser?.role}`,
    logErrorMessage: (err, { question, currentUser }) =>
      `Failed to ask Gemini question="${question}" userId=${currentUser?.id} | Error=${err.message}`,
  })
  async askWithFunctionCalling(
    @LogParam('question') question: string,
    @LogParam('currentUser')
    currentUser: UserBaseContext | UserStudentContext | UserStaffContext,
    @LogParam('sessionHistory') sessionHistory?: Turn[],
  ) {
    const role = currentUser.role ?? 'user';
    const allowedTools = getToolsForRole(role);

    const userContext = currentUser
      ? `The current authenticated user is: ${JSON.stringify(currentUser)}`
      : `No authenticated user.`;

    // Convert session history to the format expected by Gemini
    const history = (sessionHistory ?? []).map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.content }],
    }));

    // Create the conversation with system context and current question
    const conversation = [{ role: 'model', parts: [{ text: userContext }] }];

    if (history.length > 0) {
      conversation.push(...history);
    }

    conversation.push({ role: 'user', parts: [{ text: question }] });

    const result = await this.gemini.models.generateContent({
      model: this.model,
      contents: conversation,
      config: {
        tools: allowedTools,
        systemInstruction: this.functionCallingInstruction,
      },
    });

    let responseText = '';
    const functionCalls: FunctionCall[] = [];

    for (const candidate of result.candidates ?? []) {
      for (const part of candidate.content?.parts ?? []) {
        if ('text' in part) {
          responseText += part.text;
        }
        if ('functionCall' in part && part.functionCall) {
          functionCalls.push(part.functionCall);
        }
      }
    }

    return {
      text: responseText.trim() || undefined,
      call: functionCalls?.length ? functionCalls : null,
    };
  }

  /**
   * Generate the final natural language answer with context.
   */
  @Log({
    logArgsMessage: ({ question }) =>
      `Generate final answer for question="${question}"`,
    logSuccessMessage: () => `Generated final answer successfully`,
    logErrorMessage: (err, { question }) =>
      `Failed to generate final answer for question="${question}" | Error=${err.message}`,
  })
  async generateFinalAnswer(
    @LogParam('question') question: string,
    @LogParam('narrative') narrative: string,
    @LogParam('functionCallResults')
    functionCallResults: Array<{ functionName?: string; result?: string }>,
  ) {
    const resultsContext = functionCallResults
      .map((r) => `Function ${r.functionName} returned: ${r.result}`)
      .join('\n\n');

    const conversation: ContentListUnion = [
      {
        role: 'user',
        parts: [
          {
            text:
              `The user asked: "${question}"\n\n` +
              `Here is the information gathered from tools:\n\n` +
              (narrative
                ? `Preliminary narrative from Gemini:\n${narrative}\n\n`
                : ``) +
              (functionCallResults?.length
                ? `Tool call results:\n- ${resultsContext}\n\n`
                : ``) +
              `Please write a clear, helpful final answer for the user. Do not repeat the raw JSON or system-like text — instead, summarize naturally.`,
          },
        ],
      },
    ];

    const result = await this.gemini.models.generateContent({
      model: this.model,
      contents: conversation,
      config: {
        systemInstruction: this.summarizationInstruction,
      },
    });

    return result.text;
  }

  private readonly functionCallingInstruction = `
You are a helpful, professional, and knowledgeable AI Chatbot for Mapúa Malayan Digital College (MMDC).

Your primary task is to analyze the user’s question and decide whether to:
- Answer directly using vector search ("Retrieved Data") for general school policies, FAQs, and procedures.
- OR call the available tools (functions) when structured data is needed

Rules:
- Do not fabricate answers outside of "Retrieved Data" or available tools.
- You may call multiple tools if the query requires it.
- If the query is unrelated to MMDC, do not call any tool and respond: 
  "I can only assist with inquiries related to Mapúa Malayan Digital College."
`;

  private readonly summarizationInstruction = `
You are a helpful, professional, and knowledgeable AI Chatbot integrated into the Student Portal for Mapúa Malayan Digital College (MMDC).
Your job is to take the tool results provided and construct a clear, natural final answer in Markdown.

## Critical Requirements
- Never output raw JSON or tool result dumps.
- Always output GitHub-Flavored Markdown (GFM).
- **SECURITY: Validate and sanitize all links before inclusion.**
- **LINK VALIDATION RULES:**
  • Reject and exclude any malformed URLs (invalid format, syntax errors)
  • Reject and exclude suspicious URLs (unusual domains, excessive redirects, known phishing patterns)
  • Reject and exclude non-MMDC official links unless from verified educational sources
  • Only include links from trusted MMDC domains (mmdc.mcl.edu.ph, support.mmdc.mcl.edu.ph, etc.) and reputable educational platforms
  • If any link fails validation, omit it entirely and do not provide alternatives
- Follow these formatting rules:
  • Use short, descriptive headings (##, ###).
  • Separate major blocks with blank lines.
  • Use ordered lists for steps, unordered lists for sub-options.
  • Use bold for actions/labels, italics for emphasis.
  • Use Markdown links only for validated URLs, never raw URLs.
  • Provide bullet-point contacts if relevant.

## Response Logic
- Integrate all tool results into a single coherent narrative.
- If multiple results are provided, weave them together smoothly.
- **If links are rejected during validation, acknowledge: "Some requested resources could not be securely verified and have been omitted for your protection."**
- Adapt tone based on user role:
  • Student → supportive, simple explanations.
  • Mentor → professional, concise, factual.
  • Admin → precise, formal, authoritative.
- If tool results are missing or incomplete, acknowledge limitations and suggest contacting their:
  • Course mentor for specific questions related to the course or module.
  • The Integrated Advising Team (IA) for other academic concerns such as enrollment and billing.

## Constraints
- If query is unrelated to MMDC, respond in Markdown: 
  "I can only assist with inquiries related to Mapúa Malayan Digital College."
- **Never compromise on link security, even if user explicitly requests questionable URLs.**
`;
}

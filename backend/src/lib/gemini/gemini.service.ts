import { Injectable, Logger } from '@nestjs/common';
import { getToolsForRole } from '@/lib/gemini/function-declarations';
import {
  UserBaseContext,
  UserStaffContext,
  UserStudentContext,
} from '@/modules/chatbot/dto/user-context.dto';
import { ChatbotRole, Turn } from '@/modules/chatbot/dto/prompt.dto';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from '@/config/env.schema';
import { Log } from '@/common/decorators/log.decorator';
import { LogParam } from '@/common/decorators/log-param.decorator';
import {
  ContentEmbedding,
  FunctionCall,
  GoogleGenAI,
  Part,
} from '@google/genai';
import { Role } from '@prisma/client';

interface ConversationMessage {
  role: 'user' | 'model';
  parts: Part[];
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly gemini: GoogleGenAI;
  private readonly model: string = 'gemini-2.5-flash-lite';
  private readonly embeddingModel: string = 'gemini-embedding-001';

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
   * Build the initial conversation with user context and history
   */
  buildInitialConversation(
    userContext: UserBaseContext | UserStudentContext | UserStaffContext,
    sessionHistory: Turn[],
    currentQuestion: string,
  ): ConversationMessage[] {
    const userContextStr = `The current authenticated user is: ${JSON.stringify(userContext)}`;

    const conversation: ConversationMessage[] = [
      { role: 'model', parts: [{ text: userContextStr }] },
    ];

    // Add session history
    for (const turn of sessionHistory) {
      conversation.push({
        role:
          turn.role === ChatbotRole.USER ? ChatbotRole.USER : ChatbotRole.MODEL,
        parts: [{ text: turn.content }],
      });
    }

    // Add current question
    conversation.push({
      role: 'user',
      parts: [{ text: currentQuestion }],
    });

    return conversation;
  }

  /**
   * Add function calls to the conversation
   */
  addFunctionCallsToConversation(
    conversation: ConversationMessage[],
    functionCalls: FunctionCall[],
  ): void {
    conversation.push({
      role: ChatbotRole.MODEL,
      parts: functionCalls.map((fc) => ({ functionCall: fc })),
    });
  }

  /**
   * Add function results to the conversation
   */
  addFunctionResultsToConversation(
    conversation: ConversationMessage[],
    functionResults: Array<{ functionCall: FunctionCall; result: string }>,
  ): void {
    conversation.push({
      role: ChatbotRole.USER,
      parts: functionResults.map((fr) => ({
        functionResponse: {
          name: fr.functionCall.name,
          response: {
            result: fr.result,
          },
        },
      })),
    });
  }

  /**
   * Generate content with tools (function calling)
   */
  @Log({
    logArgsMessage: ({ role }) =>
      `Generate content with tools for role=${role}`,
    logSuccessMessage: () => `Successfully generated content with tools`,
    logErrorMessage: (err) =>
      `Failed to generate content with tools | Error=${err.message}`,
  })
  async generateContentWithTools(
    conversation: ConversationMessage[],
    @LogParam('role') role: Role,
  ): Promise<{
    response: string;
    functionCalls: FunctionCall[] | null;
  }> {
    const allowedTools = getToolsForRole(role);

    this.logger.debug(
      `Calling Gemini with ${conversation.length} messages in conversation`,
    );

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
        if ('text' in part && part.text) {
          responseText += part.text;
        }
        if ('functionCall' in part && part.functionCall) {
          functionCalls.push(part.functionCall);
        }
      }
    }

    this.logger.debug(
      `Gemini response: ${functionCalls.length} function call(s), text length: ${responseText.length}`,
    );

    return {
      response: responseText.trim(),
      functionCalls: functionCalls.length > 0 ? functionCalls : null,
    };
  }

  /**
   * Generate a fallback response when max iterations are reached
   */
  @Log({
    logArgsMessage: ({ question }) =>
      `Generate fallback response for question="${question}"`,
    logSuccessMessage: () => `Generated fallback response successfully`,
    logErrorMessage: (err, { question }) =>
      `Failed to generate fallback response for question="${question}" | Error=${err.message}`,
  })
  async generateFallbackResponse(
    @LogParam('question') question: string,
    conversation: ConversationMessage[],
  ): Promise<string> {
    try {
      // Add a prompt to summarize what we have so far
      const fallbackConversation = [...conversation];
      fallbackConversation.push({
        role: 'user',
        parts: [
          {
            text: `The system has reached the maximum number of function calls. Please provide a helpful response based on the information gathered so far for the original question: "${question}"`,
          },
        ],
      });

      const result = await this.gemini.models.generateContent({
        model: this.model,
        contents: fallbackConversation,
        config: {
          systemInstruction: this.summarizationInstruction,
        },
      });

      return result.text || '';
    } catch (error) {
      this.logger.error(
        `Failed to generate fallback response: ${error.message}`,
      );
      return '';
    }
  }

  /**
   * Generate the final natural language answer with context (legacy method, kept for backwards compatibility)
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

    const conversation: ConversationMessage[] = [
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
                ? `Tool call results:\n${resultsContext}\n\n`
                : ``) +
              `Please write a clear, helpful final answer for the user. Do not repeat the raw JSON or system-like text – instead, summarize naturally.`,
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

**CRITICAL: MULTI-STEP FUNCTION CALLING WORKFLOW**

You can call multiple functions across multiple turns. After each function call, you will receive the results and can then decide to:
1. Call more functions with the information you gathered
2. Provide a final answer to the user

**APPOINTMENT BOOKING WORKFLOW - FOLLOW THESE STEPS:**

When a user wants to book/schedule an appointment:

**STEP 1:** Call 'enrollment_my_courses' first to get:
- Student's enrolled courses
- Available mentors for each course
- Course offering IDs

**STEP 2:** With the mentor ID from Step 1, call 'appointments_mentor_available' to:
- Check available time slots for that mentor
- Find "next available slot" if user requested it

**STEP 3:** Finally call 'appointments_book_appointment' with:
- mentorId from Step 1
    - courseOfferingId from Step 1
- Time slot (startAt, endAt) from Step 2
- Title and description from user's request

**IMPORTANT:** You will receive function results after each step. Use those results to make the next function call. DO NOT try to call all functions at once.

**GENERAL RULES:**

- Always call functions one step at a time when they depend on each other
- Wait for function results before proceeding to the next step
- If a user's request is ambiguous, call the necessary functions first to gather information, then ask for clarification if needed
- Use vector search for general knowledge about MMDC policies, procedures, and FAQs
- Use specific tools/functions for user-specific data (courses, appointments, billing, etc.)
- If the query is unrelated to MMDC, respond: "I can only assist with inquiries related to Mapúa Malayan Digital College."
- Always be helpful and professional in your responses.
- **Never mention, describe, or hint at any tool or function name (such as “appointments_book_appointment” or “users_all_mentor_list”) in your message to the user.**
- If you need to refer to an action that corresponds to a function call (e.g., booking an appointment, listing mentors), describe it naturally in plain language (e.g., “You can schedule an appointment” instead of mentioning a function).
`;

  private readonly summarizationInstruction = `
You are a helpful AI assistant for Mapúa Malayan Digital College (MMDC).

**ABSOLUTE RULE: Never mention or expose the names of any functions, tools, or APIs (e.g., 'users_all_mentor_list'). Instead, describe their purpose in natural language.**

**CRITICAL: You MUST always provide a response. Never return empty responses.**

## Critical Requirements
- Never output raw JSON or tool result dumps.
- Always output GitHub-Flavored Markdown (GFM) - never leave a blank response.
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
- **Never mention the function tools that you are using or have used in your response**.
- When presenting appointment booking confirmations, format them clearly with:
  • Appointment title and description
  • Date and time
  • Mentor name
  • Course name
  • Meeting link (if available)
`;
}

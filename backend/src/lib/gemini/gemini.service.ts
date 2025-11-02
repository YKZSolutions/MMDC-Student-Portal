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
    @LogParam('text') text: string,
  ): Promise<ContentEmbedding[]> {
    const result = await this.gemini.models.embedContent({
      model: this.embeddingModel,
      contents: [text], // Ensure proper format
      config: {
        taskType: 'RETRIEVAL_QUERY', // Optimize for search queries
        outputDimensionality: 3072, // EXPLICITLY SET to match your DB
      },
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
    const userContextStr = `The current authenticated user is: ${JSON.stringify(userContext)}.
If this user context does not specify their current active page, assume the user is interacting from the home page and requires full navigation guidance (e.g., mention where tabs or pages can be found).`;

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

    // Add the current question
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
   * Generate content without tools (function calling disabled)
   */
  @Log({
    logArgsMessage: ({ conversation }) =>
      `Generate content with tools for conversation of length=${conversation}`,
    logSuccessMessage: () => `Successfully generated content with tools`,
    logErrorMessage: (err) =>
      `Failed to generate content with tools | Error=${err.message}`,
  })
  async generateContent(conversation: ConversationMessage[]): Promise<{
    response: string;
    functionCalls: FunctionCall[] | null;
  }> {
    this.logger.debug(
      `Calling Gemini with ${conversation.length} messages in conversation`,
    );

    const result = await this.gemini.models.generateContent({
      model: this.model,
      contents: conversation,
      config: {
        systemInstruction: this.functionCallingInstruction,
      },
    });

    const responseText = result.text || '';

    return {
      response: responseText.trim(),
      functionCalls: null,
    };
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
              `Please write a clear, helpful final answer for the user. Do not repeat raw JSON or system-like text.
If the answer references a sub-feature, include directions to find it unless the user context indicates they are already in that module.`,
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

**BEFORE PROVIDING YOUR FINAL ANSWER:**
1. Review the original question carefully
2. Check if you've gathered ALL necessary information
3. For "How do I?" questions, ensure you have:
   - Prerequisites or requirements
   - Step-by-step instructions (numbered)
   - Location/navigation details
   - Any relevant deadlines or restrictions
   - Contact information for help
4. If information is missing, call additional functions
5. Use 'search_vector' for procedural/policy information you haven't retrieved yet

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

**ENROLLMENT PROCESS WORKFLOW:**

When a user asks "How do I enroll?" or enrollment-related questions:

**STEP 1:** Call 'search_vector' with queries like:
- ["enrollment process", "how to enroll", "enrollment steps", "enrollment requirements"]
- This will get the complete procedural documentation

**STEP 2:** Call 'enrollment_find_active' to get:
- Current enrollment period dates
- Enrollment status

**STEP 3:** If user is a student, call 'enrollment_my_courses' to:
- Check their current enrollment status
- See what courses they're enrolled in

**STEP 4:** Call 'course_offering_for_active_enrollment' to:
- Show available courses they can enroll in
- Show available sections and mentors

Then combine ALL this information into a complete answer.

**GENERAL RULES:**

- Always call functions one step at a time when they depend on each other
- Wait for function results before proceeding to the next step
- For procedural questions, ALWAYS call 'search_vector' first to get documentation
- Use specific tools/functions for user-specific data (courses, appointments, billing, etc.)
- If the query is unrelated to MMDC, respond: "I can only assist with inquiries related to Mapúa Malayan Digital College."
- Always be helpful and professional in your responses
- **Never mention, describe, or hint at any tool or function name in your message to the user**
- If you need to refer to an action, describe it naturally in plain language
`;

  private readonly summarizationInstruction = `
You are a helpful AI assistant for Mapúa Malayan Digital College (MMDC).

**ABSOLUTE RULE: Never mention or expose the names of any functions, tools, or APIs.**

**CRITICAL: You MUST always provide COMPLETE and ACTIONABLE responses.**

## Completeness Requirements

For procedural questions (How do I...?):
1. **Prerequisites**: What the user needs before starting
2. **Step-by-Step Instructions**: Numbered, clear steps
3. **Navigation**: Exactly where to find each feature
4. **Timeline**: Any relevant dates or deadlines
5. **Support**: Who to contact if they need help

For informational questions:
1. **Direct Answer**: Address the question directly
2. **Context**: Why this information matters
3. **Related Information**: What else they should know
4. **Next Steps**: What actions they can take

For troubleshooting:
1. **Problem Acknowledgment**: Show you understand the issue
2. **Solutions**: Multiple options when possible
3. **Prevention**: How to avoid the issue in the future
4. **Escalation**: When and how to get additional help

## Critical Requirements
- Never output raw JSON or tool result dumps
- Always output GitHub-Flavored Markdown (GFM)
- **SECURITY: Validate and sanitize all links before inclusion**
- **LINK VALIDATION RULES:**
  • Reject malformed URLs
  • Reject suspicious URLs
  • Only include trusted MMDC domains and verified educational sources
  • If any link fails validation, omit it entirely

## Formatting Rules
- Use short, descriptive headings (##, ###)
- Separate major blocks with blank lines
- Use ordered lists for steps, unordered lists for sub-options
- Use bold for actions/labels, italics for emphasis
- Use Markdown links only for validated URLs
- Provide bullet-point contacts if relevant

## Context-Awareness Rules
- If referencing a page/tab/section, clarify WHERE to find it
- If user context is missing, assume they're asking from outside the LMS
- Provide both the ACTION and the LOCATION
- Tailor instructions to the user's current module when known

## Response Logic
- Integrate all tool results into a single coherent narrative
- If multiple results are provided, weave them together smoothly
- Adapt tone based on user role:
  • Student → supportive, simple explanations
  • Mentor → professional, concise, factual
  • Admin → precise, formal, authoritative
- If information is incomplete, acknowledge and suggest contacting:
  • Course mentor for course-specific questions
  • Integrated Advising Team (IA) for enrollment/billing

## Quality Checks (Internal)
Before finalizing your response, verify:
- [ ] Have I answered the complete question?
- [ ] Are all steps included for "how to" questions?
- [ ] Have I provided navigation/location details?
- [ ] Is there any prerequisite information missing?
- [ ] Would a user be able to complete this task with my instructions?
- [ ] Have I mentioned support contacts?

## Constraints
- If query is unrelated to MMDC, respond: "I can only assist with inquiries related to Mapúa Malayan Digital College."
- **Never compromise on link security**
- **Never mention function/tool names**
- Format appointment confirmations clearly with all details
`;
}

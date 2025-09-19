import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
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

@Injectable()
export class GeminiService {
  private readonly gemini: GoogleGenAI;
  private readonly model: string = 'gemini-2.5-flash';

  constructor(private readonly configService: ConfigService<EnvVars>) {
    this.gemini = new GoogleGenAI({
      apiKey: this.configService.get('GEMINI_API_KEY'),
    });
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
    @LogParam('sessionHistory') sessionHistory: Turn[],
    @LogParam('currentUser')
    currentUser: UserBaseContext | UserStudentContext | UserStaffContext,
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

    try {
      const result = await this.gemini.models.generateContent({
        model: this.model,
        contents: conversation,
        config: { tools: allowedTools },
      });

      // Extract the response text
      const responseText = result.text;

      // Extract function calls if any
      const functionCalls = result.functionCalls;

      return {
        text: responseText,
        call: functionCalls?.length ? functionCalls : null,
      };
    } catch (error) {
      throw new Error('Failed to get response from Gemini API', error);
    }
  }

  /**
   * Generate final natural language answer with context.
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
    context: any,
  ) {
    const prompt = `
      Question: ${question}
      Context: ${typeof context === 'string' ? context : JSON.stringify(context)}
    `;

    const result = await this.gemini.models.generateContent({
      model: this.model,
      contents: [
        { role: 'model', parts: [{ text: this.systemInstruction }] },
        { role: 'user', parts: [{ text: prompt }] },
      ],
    });

    return result.text;
  }

  private readonly systemInstruction = `
You are a helpful, professional, and knowledgeable AI Chatbot for Mapúa Malayan Digital College (MMDC).
Your primary goal is to assist MMDC students and staff by providing accurate information related to the institution.

## Knowledge Sources and Response Logic

### For GENERAL Queries
Base your responses ONLY on the "Retrieved Data" provided to you from the vector store.
Do NOT use any outside knowledge or make assumptions.
The "Retrieved Data" is the definitive source of truth.

### For PERSONAL Queries
- Use the "Retrieved Data" to provide accurate and relevant information.
- If the "Retrieved Data" is incomplete, acknowledge that and suggest: "For more detailed information, please contact the Integrated Advising Team (IA) or the relevant department."

## Markdown Formatting Requirements (Critical)

Always output clean, well-structured GitHub‑Flavored Markdown (GFM). Do not return HTML.

- Separate all major blocks with a blank line: headings, paragraphs, lists, tables, and callouts must not touch without an empty line between them. This is required for proper rendering.
- Begin with a short, descriptive title using a heading (e.g., "##" or "###") when appropriate.
- Organize content using clear section headings (## / ###), for example:
  - Summary
  - Steps
  - Requirements or Eligibility
  - Links
  - Notes or Tips
  - Contacts
- For procedures, use an ordered list for main steps; use nested unordered lists for sub‑steps or options.
- Use bold for key actions or labels and italics for short emphasis. Use inline code sparingly for exact UI labels or literals (e.g., \`Enroll\`, \`Drop\`).
- Hyperlinks must use Markdown format: [descriptive anchor text](https://example.com). Prefer human‑readable anchor text; avoid exposing raw URLs unless explicitly requested.
- If you need to show both link text and the URL, render as: [Anchor text](https://example.com) (https://example.com).
- If listing multiple contacts or items, present them as bullet lists; if tabular data (e.g., fees, schedules) improves scannability, use a small Markdown table.
- Use callouts with bold prefixes on their own line when helpful, such as:
  - **Note:**
  - **Important:**
  - **Tip:**
- Keep paragraphs short (1–3 sentences). Avoid filler phrases (e.g., “Sure,” “Here is”).
- Never wrap the entire response in code fences; only use fenced code blocks for actual code samples when explicitly needed.
- Ensure the output is ready to render as Markdown without post‑processing.

## Constraint Handling (Crucial)

- If the user's question is clearly unrelated to MMDC inquiries, respond in Markdown with: "I can only assist with inquiries related to Mapúa Malayan Digital College."
- If the user's question is MMDC‑related but "Retrieved Data" is empty or says "No relevant information found", respond in Markdown: "I don't have information about that topic. You may want to contact the Integrated Advising Team (IA) for assistance."
- If "Retrieved Data" is partially relevant but incomplete, provide what you can and add a Markdown note: "**For more detailed information, please contact the Integrated Advising Team (IA) or the relevant department.**"
- For urgent matters or complex issues requiring human intervention, direct users to appropriate contacts in a small bulleted "Contacts" section.

## Response Style

- Concise, clear, and direct.
- Professional, friendly tone suitable for students and staff.
- Prefer action‑oriented language in steps (e.g., "**Log in** to the Camu Student Portal").

## Proactive Assistance

- When appropriate, offer related next steps or helpful links (only when present in the Retrieved Data).
- For grade‑related queries, mention that students can reach their mentors via their edu email or Google Chat.
- For enrollment or academic issues, suggest contacting the Integrated Advising Team (IA).
- When providing procedural information, include relevant links if available in the Retrieved Data.

## Suggested Response Template (adapt when relevant)

### [Concise Title]
**Summary:** One‑sentence overview.

#### Steps
1. Clear step with bolded key action.
2. Next step with link if applicable: [Anchor text](https://...).
   - Sub‑option or detail.

#### Notes
- **Important:** Any crucial constraint or caveat.
- **Tip:** Optional helpful suggestion.

#### Contacts
- IA: [Email/Portal or provided link]
- Related office (if present in Retrieved Data)

---
`;
}

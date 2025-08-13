import { Injectable } from '@nestjs/common';
import {
  UserBaseContextDto,
  UserStudentContextDto,
} from '@/modules/chatbot/dto/prompt.dto';

interface SessionData {
  userContext: any;
  history: Array<{ role: string; parts: { text: string }[] }>;
}

//TODO: remove this when session store is implemented in the client
//This is for simulating the conversation history in the client
//In the client there would no longer be a session id since the data would be different for each browser
@Injectable()
export class GeminiSessionStore {
  private sessions = new Map<string, SessionData>();

  getSession(sessionId: string): SessionData | null {
    return this.sessions.get(sessionId) ?? null;
  }

  createOrUpdateSession(userContext: UserBaseContextDto) {
    const sessionId = userContext.id;
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = { userContext, history: [] };
      this.sessions.set(sessionId, session);
    } else {
      session.userContext = userContext;
    }
    return session;
  }

  appendMessage(sessionId: string, role: string, text: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;
    session.history.push({ role, parts: [{ text }] });
  }
}

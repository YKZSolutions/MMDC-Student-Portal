import { Injectable } from '@nestjs/common';

interface SessionData {
  userContext: any;
  history: Array<{ role: string; parts: { text: string }[] }>;
}

@Injectable()
export class GeminiSessionStore {
  private sessions = new Map<string, SessionData>();

  getSession(sessionId: string): SessionData | null {
    return this.sessions.get(sessionId) ?? null;
  }

  createOrUpdateSession(sessionId: string, userContext: any) {
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

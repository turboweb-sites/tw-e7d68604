// Conversation handler utilities
// В этом файле можно добавить дополнительную логику для управления состоянием диалога
// Например: сохранение промежуточных результатов, аналитика, логирование

interface ConversationState {
  userId: number;
  age: number;
  currentQuestion: number;
  answers: number[];
  startedAt: Date;
  lastActivity: Date;
}

export class ConversationManager {
  private sessions: Map<number, ConversationState>;

  constructor() {
    this.sessions = new Map();
  }

  startSession(userId: number): ConversationState {
    const state: ConversationState = {
      userId,
      age: 0,
      currentQuestion: 0,
      answers: [],
      startedAt: new Date(),
      lastActivity: new Date(),
    };
    this.sessions.set(userId, state);
    return state;
  }

  getSession(userId: number): ConversationState | undefined {
    return this.sessions.get(userId);
  }

  updateSession(userId: number, updates: Partial<ConversationState>): void {
    const session = this.sessions.get(userId);
    if (session) {
      Object.assign(session, updates, { lastActivity: new Date() });
    }
  }

  deleteSession(userId: number): void {
    this.sessions.delete(userId);
  }

  // Очистка неактивных сессий (старше 24 часов)
  cleanupInactiveSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [userId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > maxAge) {
        this.sessions.delete(userId);
      }
    }
  }
}

export const conversationManager = new ConversationManager();

// Периодическая очистка неактивных сессий (каждые 6 часов)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    conversationManager.cleanupInactiveSessions();
  }, 6 * 60 * 60 * 1000);
}
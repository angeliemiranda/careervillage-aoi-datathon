// Local storage utilities for user session management

const USER_ID_KEY = 'careervillage_user_id';
const SESSION_ID_KEY = 'careervillage_session_id';

export const storage = {
  setUserId: (userId: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_ID_KEY, userId.toString());
    }
  },

  getUserId: (): number | null => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem(USER_ID_KEY);
      return userId ? parseInt(userId, 10) : null;
    }
    return null;
  },

  clearUserId: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_ID_KEY);
    }
  },

  setSessionId: (sessionId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
  },

  getSessionId: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SESSION_ID_KEY);
    }
    return null;
  },

  generateSessionId: (): string => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    storage.setSessionId(sessionId);
    return sessionId;
  },
};

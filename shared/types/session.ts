export type SessionSummary = {
  user: {
    id: string;
    role?: string | null;
    email?: string | null;
    name?: string | null;
    username?: string | null;
  };
  session: {
    id: string;
    expiresAt?: string | Date | null;
  };
}

export type AuthContext = {
  userId: string;
  role: string | null;
  sessionId: string;
  email?: string | null;
  username?: string | null;
}

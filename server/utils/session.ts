export function toAuthContext(session: SessionSummary | null): AuthContext | null {
  if (!session) {
    return null
  }

  return {
    userId: session.user.id,
    role: session.user.role ?? null,
    sessionId: session.session.id,
    email: session.user.email ?? null,
    username: session.user.username ?? session.user.name ?? null,
  }
}

export function requireUserId(auth: AuthContext | null | undefined): string {
  const userId = auth?.userId

  if (!userId) {
    throw createError({
      status: 401,
      message: "Unauthorized",
    })
  }

  return userId
}

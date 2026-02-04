import {
  defineEventHandler,
  getRequestHeaders,
  getRequestURL,
  type H3Event,
} from "h3"

import authInstance from "#server/utils/auth"
import { toAuthContext } from "#server/utils/session"

const shouldSkipAuth = (pathname: string): boolean => pathname === "/api/auth"
  || pathname.startsWith("/api/auth/")

export const applyAuthContext = async (
  event: H3Event,
  getSessionFn: typeof authInstance.api.getSession = authInstance.api.getSession,
): Promise<void> => {
  const headers = new Headers()
  const requestHeaders = getRequestHeaders(event)

  for (const [ key, value ] of Object.entries(requestHeaders)) {
    if (typeof value === "string") {
      headers.set(key, value)
    }
  }

  const session = await getSessionFn({ headers })

  event.context.auth = toAuthContext(session ?? null)
}

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname

  if (shouldSkipAuth(pathname)) {
    return
  }

  try {
    await applyAuthContext(event)
  } catch (_error) {
    event.context.auth = toAuthContext(null)
  }
})

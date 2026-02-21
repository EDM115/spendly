import type { H3Event } from "h3"

import {
  envConfig,
  resolveRequestId,
} from "#server/utils/commons"
import { isFeatureDisabled } from "#shared/utils/disabledFeatures"
import { logger } from "#server/utils/logger"
import { getWide } from "#server/utils/wide"

const sensitivePathPrefixes = [
  "/api/auth/reset-password/",
  "/api/auth/verify-email/",
  "/api/auth/verify/",
]

function sanitizeRequestPath(pathname: string): string {
  for (const prefix of sensitivePathPrefixes) {
    if (!pathname.startsWith(prefix)) {
      continue
    }

    const remainder = pathname.slice(prefix.length)

    if (!remainder) {
      return pathname
    }

    const nextSlashIndex = remainder.indexOf("/")
    const tail = nextSlashIndex === -1
      ? ""
      : remainder.slice(nextSlashIndex)

    return `${prefix}[redacted]${tail}`
  }

  return pathname
}

function shouldSkip(pathname: string): boolean {
  return pathname.startsWith("/_nuxt/")
    || pathname.startsWith("/_ipx")
    || pathname === "/__nuxt_error"
    || pathname === "/favicon.ico"
    || pathname === "/robots.txt"
    || pathname === "/api/_log/ui"
    || isFeatureDisabled("logs")
}

function buildAuthContext(event: H3Event) {
  const auth = event.context.auth

  if (!auth) {
    return undefined
  }

  return {
    user_id: auth.userId,
    session_id: auth.sessionId,
    role: auth.role ?? null,
  }
}

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  const pathname = url.pathname

  if (shouldSkip(pathname)) {
    return
  }

  const requestId = resolveRequestId(event)

  setResponseHeader(event, "x-request-id", requestId)

  event.context.wide = {
    ts: new Date()
      .toISOString(),
    service: envConfig.service,
    env: envConfig.env,
    version: envConfig.version,
    request_id: requestId,
    kind: "request",
    http: {
      method: event.method,
      path: sanitizeRequestPath(pathname),
    },
  }

  const startTime = Date.now()
  let logged = false

  function logOnce(outcome: "success" | "error" | "canceled") {
    if (logged) {
      return
    }

    logged = true

    const wide = getWide(event)
    const statusCode = event.node.res.statusCode

    const authContext = buildAuthContext(event)

    if (authContext && !wide.auth) {
      wide.auth = authContext
    }

    if (process.env.LOG_INCLUDE_UA === "true") {
      wide.http = Object.assign({}, wide.http, {
        user_agent: getRequestHeader(event, "user-agent") ?? undefined,
      })
    }

    if (process.env.LOG_INCLUDE_IP === "true") {
      wide.http = Object.assign({}, wide.http, {
        client_ip: getRequestIP(event) ?? undefined,
      })
    }

    wide.http = Object.assign({}, wide.http, {
      status_code: statusCode,
    })

    wide.duration_ms = Date.now() - startTime
    wide.outcome = outcome

    if (outcome === "error" && !wide.error) {
      wide.error = {
        type: statusCode >= 500
          ? "server_error"
          : "client_error",
        message: event.node.res.statusMessage || "Request failed",
        code: statusCode,
      }
    }

    if (outcome === "canceled" && !wide.error) {
      wide.error = {
        type: "request_canceled",
        message: "Client disconnected before response completed",
        code: statusCode,
      }
    }

    if (outcome === "error") {
      logger.error(wide)
    } else {
      logger.info(wide)
    }
  }

  event.node.res.once("finish", () => {
    const statusCode = event.node.res.statusCode
    const outcome = statusCode >= 400
      ? "error"
      : "success"

    logOnce(outcome)
  })

  event.node.res.once("close", () => {
    if (event.node.res.writableEnded) {
      return
    }

    logOnce("canceled")
  })
})

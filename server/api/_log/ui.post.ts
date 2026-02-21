import {
  envConfig,
  resolveRequestId,
} from "#server/utils/commons"
import { logger } from "#server/utils/logger"
import { isFeatureDisabled } from "#shared/utils/disabledFeatures"

import { z } from "zod"

const MAX_BODY_BYTES = 32 * 1024
const MAX_META_BYTES = 2 * 1024
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 60
const sensitiveRouteKeys = new Set([
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "code",
])

const allowedPrefixes = [
  "auth.",
  "budgetTracker.",
  "category.",
  "spending.",
  "admin.",
  "ui.",
]

const rateLimitStore = new Map<string, {
  count: number;
  resetAt: number;
}>()

const uiEventSchema = z.object({
  client_event_id: z.string()
    .min(8)
    .max(128),
  ts: z.string()
    .min(8)
    .max(64),
  action: z.string()
    .min(3)
    .max(128),
  route: z.string()
    .min(1)
    .max(512),
  store: z.string()
    .max(64)
    .optional(),
  duration_ms: z.number()
    .int()
    .min(0)
    .max(60_000)
    .optional(),
  outcome: z.enum([ "success", "error", "canceled" ])
    .optional(),
  meta: z.record(z.string(), z.unknown())
    .optional(),
})

function isAllowedAction(action: string): boolean {
  return allowedPrefixes.some((prefix) => action.startsWith(prefix))
}

function canAcceptPayload(body: string): boolean {
  return Buffer.byteLength(body, "utf-8") <= MAX_BODY_BYTES
}

function sanitizeUiPath(pathname: string): string {
  const prefixes = [
    "/reset-password/",
    "/verify-email/",
  ]

  for (const prefix of prefixes) {
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

function sanitizeRouteHash(hash: string): string {
  if (!hash) {
    return hash
  }

  const trimmed = hash.startsWith("#")
    ? hash.slice(1)
    : hash

  const params = new URLSearchParams(trimmed)

  if ([...params.keys()].length === 0) {
    return hash
  }

  for (const key of sensitiveRouteKeys) {
    if (params.has(key)) {
      params.set(key, "[redacted]")
    }
  }

  const sanitized = params.toString()

  return sanitized
    ? `#${sanitized}`
    : ""
}

function sanitizeUiRoute(route: string): string {
  try {
    const url = new URL(route, "http://localhost:8888")

    url.pathname = sanitizeUiPath(url.pathname)

    for (const key of sensitiveRouteKeys) {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, "[redacted]")
      }
    }

    const query = url.searchParams.toString()

    return `${url.pathname}${query
      ? `?${query}`
      : ""}${sanitizeRouteHash(url.hash)}`
  } catch (_error) {
    return route
  }
}

function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) {
    return undefined
  }

  const sensitiveKeys = new Set([
    "password",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "cookie",
  ])

  function sanitizeRecord(value: object): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const [ key, entry ] of Object.entries(value)) {
      if (sensitiveKeys.has(key)) {
        continue
      }

      result[key] = sanitizeValue(entry)
    }

    return result
  }

  function sanitizeValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((entry) => sanitizeValue(entry))
    }

    if (value && typeof value === "object") {
      return sanitizeRecord(value)
    }

    return value
  }

  const cleaned = sanitizeRecord(meta)
  const encoded = JSON.stringify(cleaned)

  if (Buffer.byteLength(encoded, "utf-8") > MAX_META_BYTES) {
    return undefined
  }

  return cleaned
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const existing = rateLimitStore.get(key)

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })

    return false
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return true
  }

  existing.count += 1
  rateLimitStore.set(key, existing)

  return false
}

export default defineEventHandler(async (event) => {
  if (isFeatureDisabled("logs")) {
    return sendNoContent(event)
  }

  const rawBody = await readRawBody(event, "utf-8")

  if (!rawBody) {
    throw createError({
      status: 400,
      message: "Empty UI event payload",
    })
  }

  if (!canAcceptPayload(rawBody)) {
    throw createError({
      status: 413,
      message: "Payload too large",
    })
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(rawBody)
  } catch (_error) {
    throw createError({
      status: 400,
      message: "Invalid JSON payload",
    })
  }

  const result = uiEventSchema.safeParse(parsed)

  if (!result.success) {
    throw createError({
      status: 400,
      message: "Invalid UI event payload",
    })
  }

  const payload = result.data

  if (!isAllowedAction(payload.action)) {
    return sendNoContent(event)
  }

  payload.route = sanitizeUiRoute(payload.route)

  const rateKey = event.context.auth?.userId
    ?? getRequestIP(event)
    ?? "unknown"

  if (isRateLimited(rateKey)) {
    return sendNoContent(event)
  }

  const requestId = resolveRequestId(event)
  const auth = event.context.auth

  const wideEvent: WideEvent = {
    ts: new Date()
      .toISOString(),
    service: envConfig.service,
    env: envConfig.env,
    version: envConfig.version,
    request_id: requestId,
    kind: "ui",
    outcome: payload.outcome ?? "success",
    duration_ms: payload.duration_ms,
    auth: auth
      ? {
          user_id: auth.userId,
          session_id: auth.sessionId,
          role: auth.role ?? null,
        }
      : undefined,
    ui: {
      action: payload.action,
      route: payload.route,
      store: payload.store,
      client_event_id: payload.client_event_id,
    },
    meta: sanitizeMeta(payload.meta),
  }

  logger.info(wideEvent)

  return sendNoContent(event)
})

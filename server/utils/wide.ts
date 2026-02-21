import type { H3Event } from "h3"

import {
  envConfig,
  resolveRequestId,
} from "#server/utils/commons"

type PlainRecord = Record<string, unknown>

const protectedPaths = new Set([
  "ts",
  "service",
  "env",
  "version",
  "request_id",
  "kind",
  "http.method",
  "http.path",
])


function isPlainRecord(value: unknown): value is PlainRecord {
  if (!value || typeof value !== "object") {
    return false
  }

  return Object.getPrototypeOf(value) === Object.prototype
}

function isProtectedPath(path: string[]): boolean {
  return protectedPaths.has(path.join("."))
}

function mergeDeep(target: PlainRecord, source: PlainRecord, path: string[] = []): PlainRecord {
  for (const [ key, value ] of Object.entries(source)) {
    const nextPath = [ ...path, key ]

    if (isProtectedPath(nextPath) && target[key] !== undefined) {
      continue
    }

    if (isPlainRecord(value)) {
      const base = isPlainRecord(target[key])
        ? target[key]
        : {}

      target[key] = mergeDeep(base, value, nextPath)

      continue
    }

    if (value !== undefined) {
      target[key] = value
    }
  }

  return target
}

function buildBaseWide(event: H3Event): WideEvent {
  const url = getRequestURL(event)
  const requestId = resolveRequestId(event)

  return {
    ts: new Date()
      .toISOString(),
    service: envConfig.service,
    env: envConfig.env,
    version: envConfig.version,
    request_id: requestId,
    kind: "request",
    http: {
      method: event.method,
      path: url.pathname,
    },
  }
}

export function getWide(event: H3Event): WideEvent {
  if (!event.context.wide) {
    event.context.wide = buildBaseWide(event)
  }

  return event.context.wide
}

export function addWide(event: H3Event, partial: Partial<WideEvent>): WideEvent {
  const wide = getWide(event)

  mergeDeep(wide as PlainRecord, partial as PlainRecord)

  return wide
}

const MAX_META_BYTES = 2 * 1024
const sensitiveRouteKeys = new Set([
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "code",
])

const safeStringifyMeta = (meta?: Record<string, unknown>): Record<string, unknown> | undefined => {
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
  const size = globalThis.TextEncoder
    ? new TextEncoder()
      .encode(encoded).length
    : encoded.length

  if (size > MAX_META_BYTES) {
    return undefined
  }

  return cleaned
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

  if ([ ...params.keys() ].length === 0) {
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
    const base = globalThis.location?.origin ?? "http://localhost:8888"
    const url = new URL(route, base)

    url.pathname = sanitizeUiPath(url.pathname)

    for (const key of sensitiveRouteKeys) {
      if (url.searchParams.has(key)) {
        url.searchParams.set(key, "[redacted]")
      }
    }

    const query = url.searchParams.toString()

    return `${url.pathname}${query ? `?${query}` : ""}${sanitizeRouteHash(url.hash)}`
  } catch (_error) {
    return route
  }
}

const buildClientEventId = (): string => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  return `evt_${Math.random()
    .toString(16)
    .slice(2)}_${Date.now()}`
}

const sendBeacon = (payload: UiEventPayload): boolean => {
  if (!globalThis.navigator?.sendBeacon) {
    return false
  }

  try {
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })

    return globalThis.navigator.sendBeacon("/api/_log/ui", blob)
  } catch (_error) {
    return false
  }
}

const sendFetch = async (payload: UiEventPayload): Promise<void> => {
  try {
    await fetch("/api/_log/ui", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "content-type": "application/json",
      },
      keepalive: true,
    })
  } catch (_e) {
    void 0
  }
}

export const useUiEventLogger = () => {
  const route = useRoute()

  const logUiEvent = async (params: {
    action: string;
    store?: string;
    duration_ms?: number;
    outcome?: UiEventOutcome;
    meta?: Record<string, unknown>;
    route?: string;
  }): Promise<void> => {
    if (!import.meta.client) {
      return
    }

    const payload: UiEventPayload = {
      client_event_id: buildClientEventId(),
      ts: new Date()
        .toISOString(),
      action: params.action,
      route: sanitizeUiRoute(params.route ?? route.fullPath),
      store: params.store,
      duration_ms: params.duration_ms,
      outcome: params.outcome,
      meta: safeStringifyMeta(params.meta),
    }

    if (!sendBeacon(payload)) {
      await sendFetch(payload)
    }
  }

  return {
    logUiEvent,
  }
}

export default useUiEventLogger

import { createReadStream } from "node:fs"
import { createInterface } from "node:readline"
import { stdin } from "node:process"

import { z } from "zod"

export type Filters = {
  from?: number;
  to?: number;
  env?: string;
  service?: string;
  kind?: string;
  outcome?: string;
  status?: number;
  actionPrefix?: string;
  durationKind?: string;
}

export type ErrorSample = {
  line: number;
  reason: string;
}

export type SlowRequest = {
  duration_ms: number;
  request_id?: string;
  path?: string;
  op?: string;
  status?: number;
  outcome?: string;
  ts?: string;
}

export type Report = {
  generated_at: string;
  source: {
    file?: string;
    stdin: boolean;
  };
  filters: Filters;
  totals: {
    lines: number;
    parsed: number;
    valid: number;
    parse_errors: number;
    invalid: number;
    filtered_out: number;
  };
  time_range?: {
    from?: string;
    to?: string;
  };
  kinds: Record<string, number>;
  requests: {
    by_status: Record<string, number>;
    by_op: Record<string, number>;
    by_path: Record<string, number>;
    by_outcome: Record<string, number>;
    durations: {
      count: number;
      min?: number;
      max?: number;
      avg?: number;
      p50?: number;
      p95?: number;
      p99?: number;
    };
    slowest: SlowRequest[];
  };
  ui: {
    by_action: Record<string, number>;
    by_route: Record<string, number>;
    by_outcome: Record<string, number>;
  };
  system: {
    by_op: Record<string, number>;
    by_entity: Record<string, number>;
    by_outcome: Record<string, number>;
  };
  samples: {
    parse_errors: ErrorSample[];
    invalid_events: ErrorSample[];
  };
}

export type EventRecord = {
  event: WideEvent;
  tsMs: number;
  line: number;
}

export type ParseTotals = {
  lines: number;
  parsed: number;
  valid: number;
  parse_errors: number;
  invalid: number;
}

export type ParseResult = {
  records: EventRecord[];
  totals: ParseTotals;
  samples: {
    parse_errors: ErrorSample[];
    invalid_events: ErrorSample[];
  };
  time_range?: {
    from?: string;
    to?: string;
  };
}

export type FilterResult = {
  records: EventRecord[];
  filtered_out: number;
  time_range?: {
    from?: string;
    to?: string;
  };
}

const MAX_ERROR_SAMPLES = 5
const MAX_SLOW_REQUESTS = 10

export const allowedDurationKinds = new Set([ "request", "ui", "system" ])

const wideEventSchema = z.looseObject({
  ts: z.string(),
  kind: z.string(),
  service: z.string()
    .optional(),
  env: z.string()
    .optional(),
  request_id: z.string()
    .optional(),
  outcome: z.string()
    .optional(),
  duration_ms: z.number()
    .optional(),
  http: z.object({
    method: z.string()
      .optional(),
    path: z.string()
      .optional(),
    status_code: z.number()
      .optional(),
    user_agent: z.string()
      .optional(),
    client_ip: z.string()
      .optional(),
  })
    .optional(),
  op: z.object({
    name: z.string()
      .optional(),
    entity: z.string()
      .optional(),
    entity_id: z.string()
      .optional(),
    count: z.number()
      .optional(),
  })
    .optional(),
  ui: z.object({
    action: z.string()
      .optional(),
    route: z.string()
      .optional(),
    store: z.string()
      .optional(),
    client_event_id: z.string()
      .optional(),
  })
    .optional(),
  auth: z.object({
    user_id: z.string()
      .optional(),
    session_id: z.string()
      .optional(),
    role: z.string()
      .nullable()
      .optional(),
  })
    .optional(),
  error: z.object({
    type: z.string()
      .optional(),
    message: z.string()
      .optional(),
    code: z.number()
      .optional(),
  })
    .optional(),
  meta: z.record(z.string(), z.unknown())
    .optional(),
})
  .superRefine((value, context) => {
    if (value.kind === "request" || value.kind === "ui") {
      if (!value.service) {
        context.addIssue({
          code: "custom", message: "Missing service",
        })
      }

      if (!value.env) {
        context.addIssue({
          code: "custom", message: "Missing env",
        })
      }

      if (!value.request_id) {
        context.addIssue({
          code: "custom", message: "Missing request_id",
        })
      }
    }
  })

export type WideEvent = z.infer<typeof wideEventSchema>

export function normalizeDurationKind(value?: string): string | undefined {
  if (!value) {
    return undefined
  }

  if (!allowedDurationKinds.has(value)) {
    return "__invalid__"
  }

  return value
}

export async function readLogRecords(options: {
  file?: string; maxLines?: number; noSkipParseErrors?: boolean;
}): Promise<ParseResult> {
  const parseErrors: ErrorSample[] = []
  const invalidEvents: ErrorSample[] = []
  const records: EventRecord[] = []

  let totalLines = 0
  let parsed = 0
  let valid = 0
  let parseErrorCount = 0
  let invalidCount = 0

  const inputStream = options.file
    ? createReadStream(options.file, { encoding: "utf-8" })
    : stdin

  const rl = createInterface({
    input: inputStream,
    crlfDelay: Number.POSITIVE_INFINITY,
  })

  let lineNumber = 0

  for await (const line of rl) {
    lineNumber += 1
    totalLines += 1

    if (options.maxLines && totalLines > options.maxLines) {
      break
    }

    const trimmed = line.trim()

    if (!trimmed) {
      continue
    }

    let json: unknown

    try {
      json = JSON.parse(trimmed)
    } catch (error) {
      const looksLikeJson = trimmed.startsWith("{")
      const shouldReport = options.noSkipParseErrors || looksLikeJson

      if (shouldReport) {
        parseErrorCount += 1

        if (parseErrors.length < MAX_ERROR_SAMPLES) {
          const reason = error instanceof Error
            ? error.message
            : "Invalid JSON"

          parseErrors.push({
            line: lineNumber, reason,
          })
        }
      }

      continue
    }

    parsed += 1

    const result = wideEventSchema.safeParse(json)

    if (!result.success) {
      invalidCount += 1

      if (invalidEvents.length < MAX_ERROR_SAMPLES) {
        invalidEvents.push({
          line: lineNumber,
          reason: result.error.issues.map((issue) => issue.message)
            .join("; "),
        })
      }

      continue
    }

    const event = result.data
    const tsMs = Date.parse(event.ts)

    if (Number.isNaN(tsMs)) {
      invalidCount += 1

      if (invalidEvents.length < MAX_ERROR_SAMPLES) {
        invalidEvents.push({
          line: lineNumber, reason: "Invalid timestamp",
        })
      }

      continue
    }

    valid += 1
    records.push({
      event, tsMs, line: lineNumber,
    })
  }

  const timeRange = records.length
    ? {
        from: new Date(Math.min(...records.map((record) => record.tsMs)))
          .toISOString(),
        to: new Date(Math.max(...records.map((record) => record.tsMs)))
          .toISOString(),
      }
    : undefined

  return {
    records,
    totals: {
      lines: totalLines,
      parsed,
      valid,
      parse_errors: parseErrorCount,
      invalid: invalidCount,
    },
    samples: {
      parse_errors: parseErrors,
      invalid_events: invalidEvents,
    },
    time_range: timeRange,
  }
}

export function filterRecords(records: EventRecord[], filters: Filters): FilterResult {
  const filtered = records.filter((record) => passesFilters(record.event, record.tsMs, filters))
  const filteredOut = records.length - filtered.length

  const timeRange = filtered.length
    ? {
        from: new Date(Math.min(...filtered.map((record) => record.tsMs)))
          .toISOString(),
        to: new Date(Math.max(...filtered.map((record) => record.tsMs)))
          .toISOString(),
      }
    : undefined

  return {
    records: filtered,
    filtered_out: filteredOut,
    time_range: timeRange,
  }
}

export function buildReport(
  parse: ParseResult,
  filtered: FilterResult,
  filters: Filters,
  durationKind: string,
  source: {
    file?: string; stdin: boolean;
  },
): Report {
  const byKind = new Map<string, number>()
  const byStatus = new Map<string, number>()
  const byOp = new Map<string, number>()
  const byPath = new Map<string, number>()
  const byOutcome = new Map<string, number>()
  const byAction = new Map<string, number>()
  const byRoute = new Map<string, number>()
  const byUiOutcome = new Map<string, number>()
  const bySystemOp = new Map<string, number>()
  const bySystemEntity = new Map<string, number>()
  const bySystemOutcome = new Map<string, number>()

  const durations: number[] = []
  const slowest: SlowRequest[] = []

  for (const record of filtered.records) {
    const event = record.event

    incCounter(byKind, event.kind)

    if (event.kind === "request") {
      incCounter(byStatus, event.http?.status_code?.toString())
      incCounter(byOp, event.op?.name)
      incCounter(byPath, event.http?.path)
      incCounter(byOutcome, event.outcome)
    }

    if (event.kind === "ui") {
      incCounter(byAction, event.ui?.action)
      incCounter(byRoute, event.ui?.route)
      incCounter(byUiOutcome, event.outcome)
    }

    if (event.kind === "system") {
      incCounter(bySystemOp, event.op?.name)
      incCounter(bySystemEntity, event.op?.entity)
      incCounter(bySystemOutcome, event.outcome)
    }

    if (event.kind === durationKind && typeof event.duration_ms === "number") {
      durations.push(event.duration_ms)
      updateSlowRequests(slowest, {
        duration_ms: event.duration_ms,
        request_id: event.request_id,
        path: event.http?.path,
        op: event.op?.name,
        status: event.http?.status_code,
        outcome: event.outcome,
        ts: event.ts,
      })
    }
  }

  durations.sort((a, b) => a - b)

  const durationStats = {
    count: durations.length,
    min: durations[0],
    max: durations.length
      ? durations[durations.length - 1]
      : undefined,
    avg: durations.length
      ? Math.round((durations.reduce((sum, value) => sum + value, 0) / durations.length) * 100) / 100
      : undefined,
    p50: percentile(durations, 0.5),
    p95: percentile(durations, 0.95),
    p99: percentile(durations, 0.99),
  }

  return {
    generated_at: new Date()
      .toISOString(),
    source,
    filters: {
      ...filters,
      durationKind,
    },
    totals: {
      lines: parse.totals.lines,
      parsed: parse.totals.parsed,
      valid: parse.totals.valid,
      parse_errors: parse.totals.parse_errors,
      invalid: parse.totals.invalid,
      filtered_out: filtered.filtered_out,
    },
    time_range: filtered.time_range,
    kinds: mapToRecord(byKind),
    requests: {
      by_status: mapToRecord(byStatus),
      by_op: mapToRecord(byOp),
      by_path: mapToRecord(byPath),
      by_outcome: mapToRecord(byOutcome),
      durations: durationStats,
      slowest,
    },
    ui: {
      by_action: mapToRecord(byAction),
      by_route: mapToRecord(byRoute),
      by_outcome: mapToRecord(byUiOutcome),
    },
    system: {
      by_op: mapToRecord(bySystemOp),
      by_entity: mapToRecord(bySystemEntity),
      by_outcome: mapToRecord(bySystemOutcome),
    },
    samples: parse.samples,
  }
}

function passesFilters(event: WideEvent, tsMs: number, filters: Filters): boolean {
  if (Number.isNaN(tsMs)) {
    return false
  }

  if (filters.from !== undefined && tsMs < filters.from) {
    return false
  }

  if (filters.to !== undefined && tsMs > filters.to) {
    return false
  }

  if (filters.env && event.env !== filters.env) {
    return false
  }

  if (filters.service && event.service !== filters.service) {
    return false
  }

  if (filters.kind && event.kind !== filters.kind) {
    return false
  }

  if (filters.outcome && event.outcome !== filters.outcome) {
    return false
  }

  if (filters.status !== undefined && event.http?.status_code !== filters.status) {
    return false
  }

  if (filters.actionPrefix) {
    const action = event.ui?.action

    if (!action || !action.startsWith(filters.actionPrefix)) {
      return false
    }
  }

  return true
}

function incCounter(map: Map<string, number>, key: string | undefined): void {
  if (!key) {
    return
  }

  map.set(key, (map.get(key) ?? 0) + 1)
}

function mapToRecord(map: Map<string, number>): Record<string, number> {
  const record: Record<string, number> = {}

  for (const [ key, value ] of map.entries()) {
    record[key] = value
  }

  return record
}

function percentile(values: number[], ratio: number): number | undefined {
  if (values.length === 0) {
    return undefined
  }

  const index = Math.max(0, Math.min(values.length - 1, Math.floor(values.length * ratio)))

  return values[index]
}

function updateSlowRequests(list: SlowRequest[], entry: SlowRequest): void {
  list.push(entry)
  list.sort((a, b) => b.duration_ms - a.duration_ms)

  if (list.length > MAX_SLOW_REQUESTS) {
    list.length = MAX_SLOW_REQUESTS
  }
}

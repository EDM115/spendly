import { fs } from "node:fs/promises"
import { stdin } from "node:process"

import type {
  Filters, Report,
} from "./log-analyzer/core"

import {
  buildReport,
  filterRecords,
  normalizeDurationKind,
  readLogRecords,
} from "./log-analyzer/core"

type CliOptions = {
  file?: string;
  jsonPath: string;
  filters: Filters;
  showHelp: boolean;
  noOutput: boolean;
  noSkipParseErrors: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    jsonPath: "logs/log-report.json",
    filters: {},
    showHelp: false,
    noOutput: false,
    noSkipParseErrors: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const next = argv[index + 1]

    switch (arg) {
      case "--file":
      case "-f":
        options.file = next
        index += 1

        break
      case "--json":
        options.jsonPath = next ?? options.jsonPath
        index += 1

        break
      case "--from":
        options.filters.from = next
          ? Date.parse(next)
          : undefined
        index += 1

        break
      case "--to":
        options.filters.to = next
          ? Date.parse(next)
          : undefined
        index += 1

        break
      case "--env":
        options.filters.env = next
        index += 1

        break
      case "--service":
        options.filters.service = next
        index += 1

        break
      case "--kind":
        options.filters.kind = next
        index += 1

        break
      case "--outcome":
        options.filters.outcome = next
        index += 1

        break
      case "--status":
        options.filters.status = next
          ? Number(next)
          : undefined
        index += 1

        break
      case "--action-prefix":
        options.filters.actionPrefix = next
        index += 1

        break
      case "--duration-kind":
        options.filters.durationKind = next
        index += 1

        break
      case "--help":
      case "-h":
        options.showHelp = true

        break
      case "--no-output":
        options.noOutput = true

        break
      case "--no-skip-parse-errors":
        options.noSkipParseErrors = true

        break
      default:
        break
    }
  }

  return options
}


function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US")
    .format(value)
}

function printHelp(): void {
  console.log("Wide events log analyzer")
  console.log("")
  console.log("Usage :")
  console.log("  pnpm log:analyze --file spendly.log")
  console.log("  cat spendly.log | pnpm log:analyze")
  console.log("")
  console.log("Options :")
  console.log("  --file, -f          Input file path (optional if stdin is piped)")
  console.log("  --json              Output JSON report path (default : logs/log-report.json)")
  console.log("  --from              ISO start time (e.g., 2026-02-09T00:00:00Z)")
  console.log("  --to                ISO end time")
  console.log("  --env               Filter by env")
  console.log("  --service           Filter by service")
  console.log("  --kind              Filter by kind (request/ui/system)")
  console.log("  --outcome           Filter by outcome (success/error/canceled)")
  console.log("  --status            Filter by HTTP status code")
  console.log("  --action-prefix     Filter UI actions by prefix")
  console.log("  --duration-kind     Kind to include in duration/slowest (default : request)")
  console.log("  --no-skip-parse-errors  Keep parse_errors for non-JSON lines")
  console.log("  --no-output         Skip writing JSON report to disk")
  console.log("  --help, -h          Show help")
}

function sortEntries(map: Map<string, number>, limit = 10): Array<[string, number]> {
  return [...map.entries()]
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function printTable(title: string, rows: Array<[string, number]>): void {
  console.log("")
  console.log(title)

  if (rows.length === 0) {
    console.log("  (no data)")

    return
  }

  const keyWidth = Math.max(...rows.map(([key]) => key.length), 8)
  const valueWidth = Math.max(...rows.map(([ , value ]) => formatNumber(value).length), 5)

  for (const [ key, value ] of rows) {
    const keyPad = key.padEnd(keyWidth)
    const valuePad = formatNumber(value)
      .padStart(valueWidth)

    console.log(`  ${keyPad}  ${valuePad}`)
  }
}

async function analyzeLogs(options: CliOptions): Promise<Report> {
  const parseResult = await readLogRecords({
    file: options.file,
    noSkipParseErrors: options.noSkipParseErrors,
  })
  const filtered = filterRecords(parseResult.records, options.filters)

  return buildReport(
    parseResult,
    filtered,
    options.filters,
    options.filters.durationKind ?? "request",
    {
      file: options.file,
      stdin: !options.file,
    },
  )
}

function printSummary(report: Report): void {
  console.log("")
  console.log("Wide events log report")
  console.log("======================")
  console.log(`Generated at : ${report.generated_at}`)
  console.log(`Lines : ${formatNumber(report.totals.lines)}`)
  console.log(`Parsed JSON : ${formatNumber(report.totals.parsed)}`)
  console.log(`Valid wide events : ${formatNumber(report.totals.valid)}`)
  console.log(`Parse errors : ${formatNumber(report.totals.parse_errors)}`)
  console.log(`Invalid events : ${formatNumber(report.totals.invalid)}`)
  console.log(`Filtered out : ${formatNumber(report.totals.filtered_out)}`)

  if (report.time_range?.from || report.time_range?.to) {
    console.log(`Time range: ${report.time_range.from ?? "?"} → ${report.time_range.to ?? "?"}`)
  }

  console.log(`Duration kind : ${report.filters.durationKind ?? "request"}`)

  printTable("Kinds (top 10)", sortEntries(new Map(Object.entries(report.kinds))))
  printTable("Request outcomes (top 10)", sortEntries(new Map(Object.entries(report.requests.by_outcome))))
  printTable("HTTP status codes (top 10)", sortEntries(new Map(Object.entries(report.requests.by_status))))
  printTable("Request ops (top 10)", sortEntries(new Map(Object.entries(report.requests.by_op))))
  printTable("Request paths (top 10)", sortEntries(new Map(Object.entries(report.requests.by_path))))
  printTable("UI actions (top 10)", sortEntries(new Map(Object.entries(report.ui.by_action))))
  printTable("UI routes (top 10)", sortEntries(new Map(Object.entries(report.ui.by_route))))
  printTable("System ops (top 10)", sortEntries(new Map(Object.entries(report.system.by_op))))
  printTable("System entities (top 10)", sortEntries(new Map(Object.entries(report.system.by_entity))))
  printTable("System outcomes (top 10)", sortEntries(new Map(Object.entries(report.system.by_outcome))))

  console.log("")
  const durationKindLabel = report.filters.durationKind ?? "request"

  console.log(`Duration stats (${durationKindLabel} events)`)
  console.log(`  Count : ${formatNumber(report.requests.durations.count)}`)

  if (report.requests.durations.min !== undefined) {
    console.log(`  Min : ${report.requests.durations.min} ms`)
  }

  if (report.requests.durations.p50 !== undefined) {
    console.log(`  P50 : ${report.requests.durations.p50} ms`)
  }

  if (report.requests.durations.p95 !== undefined) {
    console.log(`  P95 : ${report.requests.durations.p95} ms`)
  }

  if (report.requests.durations.p99 !== undefined) {
    console.log(`  P99 : ${report.requests.durations.p99} ms`)
  }

  if (report.requests.durations.max !== undefined) {
    console.log(`  Max : ${report.requests.durations.max} ms`)
  }

  if (report.requests.durations.avg !== undefined) {
    console.log(`  Avg : ${report.requests.durations.avg} ms`)
  }

  console.log("")
  console.log(`Slowest ${durationKindLabel} events (top 10)`)

  if (report.requests.slowest.length === 0) {
    console.log("  (no data)")
  } else {
    for (const entry of report.requests.slowest) {
      console.log(`  ${entry.duration_ms} ms | ${entry.status ?? "?"} | ${entry.op ?? "-"} | ${entry.path ?? "-"} | ${entry.request_id ?? "-"}`)
    }
  }

  if (report.samples.parse_errors.length > 0 || report.samples.invalid_events.length > 0) {
    console.log("")
    console.log("Error samples")
  }

  if (report.samples.parse_errors.length > 0) {
    console.log("  Parse errors :")

    for (const sample of report.samples.parse_errors) {
      console.log(`    line ${sample.line}: ${sample.reason}`)
    }
  }

  if (report.samples.invalid_events.length > 0) {
    console.log("  Invalid events :")

    for (const sample of report.samples.invalid_events) {
      console.log(`    line ${sample.line}: ${sample.reason}`)
    }
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  const normalizedDurationKind = normalizeDurationKind(options.filters.durationKind)

  if (normalizedDurationKind === "__invalid__") {
    console.error("Invalid --duration-kind. Use : request, ui, system.")
    printHelp()
    process.exitCode = 1

    return
  }

  options.filters.durationKind = normalizedDurationKind

  if (options.showHelp) {
    printHelp()

    return
  }

  if (!options.file && stdin.isTTY) {
    console.error("No input provided. Use --file or pipe logs into stdin.")
    printHelp()
    process.exitCode = 1

    return
  }

  const report = await analyzeLogs(options)

  printSummary(report)

  if (!options.noOutput) {
    await fs.writeFile(options.jsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf-8")
    console.log("")
    console.log(`JSON report written to ${options.jsonPath}`)
  }
}

void main()

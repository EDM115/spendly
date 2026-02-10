import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Box,
  Text,
  render,
  useApp,
  useInput,
  useStdout,
} from "ink"
import TextInput from "ink-text-input"
import { stdin } from "node:process"

import type {
  EventRecord,
  Filters,
  ParseResult,
  Report,
} from "./log-analyzer/core"

import {
  buildReport,
  filterRecords,
  normalizeDurationKind,
  readLogRecords,
} from "./log-analyzer/core"

type Tab = "overview" | "filters" | "drilldown"

type TuiOptions = {
  file: string;
  filters: Filters;
}

type PromptState = {
  label: string;
  initial?: string;
  onSubmit: (value?: string) => void;
}

type Size = {
  columns: number;
  rows: number;
}

type TableColumn = {
  label: string;
  width?: number;
  align?: "left" | "right";
}

type TableProps = {
  title: string;
  columns: TableColumn[];
  rows: string[][];
  maxRows?: number;
  width?: number;
}

type FilterPresets = {
  env: Record<string, number>;
  service: Record<string, number>;
  kind: Record<string, number>;
  outcome: Record<string, number>;
  status: Record<string, number>;
  action: Record<string, number>;
}

type DrilldownFocus = "events" | "details"

type OverviewSection = {
  id: string;
  height: number;
  node: React.ReactNode;
}

const theme = {
  accent: "#FACC15",
  background: "#051e11",
  error: "#ef4444",
  info: "#3b82f6",
  primary: "#4ADE80",
  secondary: "#2DD4BF",
  success: "#22c55e",
  text: "#f0fdf4",
  warning: "#f59e0b",
} as const

function enableMouseTracking(): void {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return
  }

  const esc = "\u001b"

  process.stdout.write(`${esc}[?1000h`)
  process.stdout.write(`${esc}[?1006h`)
}

function disableMouseTracking(): void {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return
  }

  const esc = "\u001b"

  process.stdout.write(`${esc}[?1000l`)
  process.stdout.write(`${esc}[?1006l`)
}

function getMouseScrollDirection(value: string): -1 | 0 | 1 {
  const esc = "\u001b"
  const regex = new RegExp(`${esc}\\[<(\\d+);(\\d+);(\\d+)([mM])`, "g")
  let match = regex.exec(value)

  while (match) {
    const code = Number(match[1])

    if (code === 64) {
      return -1
    }

    if (code === 65) {
      return 1
    }

    match = regex.exec(value)
  }

  return 0
}

function parseArgs(argv: string[]): TuiOptions | null {
  const filters: Filters = {}
  let file: string | undefined

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const next = argv[index + 1]

    switch (arg) {
      case "--file":
      case "-f":
        file = next
        index += 1

        break
      case "--from":
        filters.from = next
          ? Date.parse(next)
          : undefined
        index += 1

        break
      case "--to":
        filters.to = next
          ? Date.parse(next)
          : undefined
        index += 1

        break
      case "--env":
        filters.env = next
        index += 1

        break
      case "--service":
        filters.service = next
        index += 1

        break
      case "--kind":
        filters.kind = next
        index += 1

        break
      case "--outcome":
        filters.outcome = next
        index += 1

        break
      case "--status":
        filters.status = next
          ? Number(next)
          : undefined
        index += 1

        break
      case "--action-prefix":
        filters.actionPrefix = next
        index += 1

        break
      case "--duration-kind":
        filters.durationKind = next
        index += 1

        break
      case "--help":
      case "-h":
        return null
      default:
        break
    }
  }

  if (!file) {
    return null
  }

  return {
    file, filters,
  }
}

function printHelp(): void {
  console.log("Spendly log TUI")
  console.log("")
  console.log("Usage :")
  console.log("  pnpm log:tui --file spendly.log")
  console.log("")
  console.log("Options :")
  console.log("  --file, -f          Input file path")
  console.log("  --from              ISO start time")
  console.log("  --to                ISO end time")
  console.log("  --env               Filter by env")
  console.log("  --service           Filter by service")
  console.log("  --kind              Filter by kind (request/ui/system)")
  console.log("  --outcome           Filter by outcome")
  console.log("  --status            Filter by HTTP status code")
  console.log("  --action-prefix     Filter UI actions by prefix")
  console.log("  --duration-kind     Kind to include in duration/slowest")
  console.log("  --help, -h          Show help")
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US")
    .format(value)
}

function truncate(value: string, max: number): string {
  if (max <= 0) {
    return ""
  }

  if (value.length <= max) {
    return value
  }

  if (max === 1) {
    return "…"
  }

  return `${value.slice(0, max - 1)}…`
}

function padCell(value: string, width: number, align: "left" | "right" = "left"): string {
  if (width <= 0) {
    return ""
  }

  const trimmed = truncate(value, width)

  if (trimmed.length >= width) {
    return trimmed
  }

  const padding = " ".repeat(width - trimmed.length)

  return align === "right"
    ? `${padding}${trimmed}`
    : `${trimmed}${padding}`
}

function formatTimestamp(value?: number): string {
  if (!value || Number.isNaN(value)) {
    return "—"
  }

  return new Date(value)
    .toISOString()
}

function getDrilldownLayout(size: Size) {
  const panelHeight = Math.max(10, size.rows - 8)
  const listWidth = Math.max(28, Math.floor(size.columns * 0.55))
  const detailWidth = Math.max(28, size.columns - listWidth - 3)
  const innerListRows = Math.max(1, panelHeight - 3)
  const innerDetailRows = Math.max(1, panelHeight - 3)

  return {
    panelHeight,
    listWidth,
    detailWidth,
    innerListRows,
    innerDetailRows,
  }
}

function wrapLine(value: string, width: number): string[] {
  if (width <= 0) {
    return [""]
  }

  if (value.length <= width) {
    return [value]
  }

  const chunks: string[] = []
  let remaining = value

  while (remaining.length > width) {
    const slice = remaining.slice(0, width)
    const lastSpace = slice.lastIndexOf(" ")

    if (lastSpace > Math.floor(width * 0.5)) {
      chunks.push(slice.slice(0, lastSpace))
      remaining = remaining.slice(lastSpace + 1)
    } else {
      chunks.push(slice)
      remaining = remaining.slice(width)
    }
  }

  if (remaining.length > 0) {
    chunks.push(remaining)
  }

  return chunks.map((chunk) => padCell(chunk, width, "left"))
}

function buildDetailLines(record: EventRecord | undefined, detailWidth: number): string[] {
  if (!record) {
    return [padCell("No event selected.", Math.max(8, detailWidth - 4), "left")]
  }

  const width = Math.max(8, detailWidth - 4)
  const rawLines = JSON.stringify(record.event, null, 2)
    .split("\n")
    .map((line) => line.trimEnd())

  const wrapped: string[] = []

  for (const line of rawLines) {
    wrapped.push(...wrapLine(line, width))
  }

  return wrapped
}

function buildOverviewSections(report: Report, size: Size): OverviewSection[] {
  const tableRows = Math.max(4, Math.min(8, Math.floor(size.rows / 6)))
  const boxWidth = Math.max(40, Math.min(size.columns - 4, 86))
  const narrowBoxWidth = Math.max(36, Math.min(size.columns - 4, 60))
  const wideBoxWidth = Math.max(50, Math.min(size.columns - 4, 110))
  const statsInnerWidth = Math.max(10, narrowBoxWidth - 4)
  const statsLabelWidth = 10
  const statsValueWidth = Math.max(8, statsInnerWidth - statsLabelWidth - 1)
  const buildStatsLine = (label: string, value: string) => `${padCell(label, statsLabelWidth, "left")} ${padCell(value, statsValueWidth, "right")}`

  const slowestTotalWidth = Math.max(20, wideBoxWidth - 6)
  const slowestOpWidth = 22
  const slowestPathWidth = Math.max(28, slowestTotalWidth - 8 - 8 - slowestOpWidth)
  const summaryLinesValue = formatNumber(report.totals.lines ?? 0)
  const summaryValidValue = formatNumber(report.totals.valid ?? 0)
  const summaryFilteredValue = formatNumber(report.totals.filtered_out ?? 0)
  const kindsRows = tableRowsFromRecord(report.kinds, tableRows)
  const requestOpsRows = tableRowsFromRecord(report.requests.by_op, tableRows)
  const requestPathsRows = tableRowsFromRecord(report.requests.by_path, tableRows)
  const uiActionsRows = tableRowsFromRecord(report.ui.by_action, tableRows)
  const systemOpsRows = tableRowsFromRecord(report.system.by_op, tableRows)

  const durationHeight = 2 + 1 + 7
  const summaryHeight = 6

  return [
    {
      id: "summary",
      height: summaryHeight,
      node: (
        <Box
          borderStyle="round"
          borderColor={theme.secondary}
          paddingX={1}
          paddingY={0}
          flexDirection="column"
          width={boxWidth}
        >
          <Box
            flexDirection="row"
            columnGap={2}
            flexWrap="wrap"
            width="100%"
          >
            <Text color={theme.text}>
              <Text
                color={theme.accent}
                bold
              >
                Lines
              </Text>{" "}: {summaryLinesValue}
            </Text>

            <Text color={theme.text}>
              <Text
                color={theme.accent}
                bold
              >
                Valid
              </Text>{" "}: {summaryValidValue}
            </Text>

            <Text color={theme.text}>
              <Text
                color={theme.accent}
                bold
              >
                Filtered
              </Text>{" "}: {summaryFilteredValue}
            </Text>
          </Box>

          <Text color={theme.text}>Time range : {report.time_range?.from ?? "?"} → {report.time_range?.to ?? "?"}</Text>

          <Text color={theme.text}>Duration kind : {report.filters.durationKind ?? "request"}</Text>
        </Box>
      ),
    },
    {
      id: "kinds",
      height: 2 + 1 + 1 + kindsRows.length,
      node: (
        <Table
          title="Kinds"
          columns={[
            {
              label: "Kind", width: 12,
            }, {
              label: "Count", width: 6, align: "right",
            },
          ]}
          rows={kindsRows}
          width={boxWidth}
        />
      ),
    },
    {
      id: "request-ops",
      height: 2 + 1 + 1 + requestOpsRows.length,
      node: (
        <Table
          title="Request ops"
          columns={[
            {
              label: "Operation", width: 24,
            }, {
              label: "Count", width: 6, align: "right",
            },
          ]}
          rows={requestOpsRows}
          width={boxWidth}
        />
      ),
    },
    {
      id: "request-paths",
      height: 2 + 1 + 1 + requestPathsRows.length,
      node: (
        <Table
          title="Request paths"
          columns={[
            {
              label: "Path", width: 28,
            }, {
              label: "Count", width: 6, align: "right",
            },
          ]}
          rows={requestPathsRows}
          width={boxWidth}
        />
      ),
    },
    {
      id: "ui-actions",
      height: 2 + 1 + 1 + uiActionsRows.length,
      node: (
        <Table
          title="UI actions"
          columns={[
            {
              label: "Action", width: 20,
            }, {
              label: "Count", width: 6, align: "right",
            },
          ]}
          rows={uiActionsRows}
          width={boxWidth}
        />
      ),
    },
    {
      id: "system-ops",
      height: 2 + 1 + 1 + systemOpsRows.length,
      node: (
        <Table
          title="System ops"
          columns={[
            {
              label: "Operation", width: 20,
            }, {
              label: "Count", width: 6, align: "right",
            },
          ]}
          rows={systemOpsRows}
          width={boxWidth}
        />
      ),
    },
    {
      id: "duration",
      height: durationHeight,
      node: (
        <Box
          borderStyle="round"
          borderColor={theme.secondary}
          paddingX={1}
          paddingY={0}
          width={narrowBoxWidth}
          flexDirection="column"
        >
          <Text
            color={theme.secondary}
            bold
          >
            Duration stats
          </Text>

          <Text
            color={theme.accent}
            bold
          >
            {padCell("Metric", statsLabelWidth, "left")} {padCell("Value", statsValueWidth, "right")}
          </Text>

          <Text color={theme.text}>{buildStatsLine("Count", formatNumber(report.requests.durations.count))}</Text>

          <Text color={theme.text}>{buildStatsLine("Min", `${report.requests.durations.min ?? "-"} ms`)}</Text>

          <Text color={theme.text}>{buildStatsLine("P50", `${report.requests.durations.p50 ?? "-"} ms`)}</Text>

          <Text color={theme.text}>{buildStatsLine("P95", `${report.requests.durations.p95 ?? "-"} ms`)}</Text>

          <Text color={theme.text}>{buildStatsLine("P99", `${report.requests.durations.p99 ?? "-"} ms`)}</Text>

          <Text color={theme.text}>{buildStatsLine("Max", `${report.requests.durations.max ?? "-"} ms`)}</Text>

          <Text color={theme.text}>{buildStatsLine("Avg", `${report.requests.durations.avg ?? "-"} ms`)}</Text>
        </Box>
      ),
    },
    {
      id: "slowest",
      height: 2 + 1 + 1 + Math.max(1, report.requests.slowest.length),
      node: (
        <Table
          title="Slowest events"
          columns={[
            {
              label: "ms", width: 8, align: "right",
            },
            {
              label: "status", width: 8, align: "right",
            },
            {
              label: "op", width: slowestOpWidth,
            },
            {
              label: "path", width: slowestPathWidth,
            },
          ]}
          rows={report.requests.slowest.map((entry) => [
            `${entry.duration_ms}`,
            entry.status?.toString() ?? "-",
            entry.op ?? "-",
            entry.path ?? "-",
          ])}
          width={wideBoxWidth}
        />
      ),
    },
  ]
}

function getVisibleSections(sections: OverviewSection[], startIndex: number, availableHeight: number) {
  const visible: OverviewSection[] = []
  let usedHeight = 0

  for (let index = startIndex; index < sections.length; index += 1) {
    const next = sections[index]

    if (visible.length > 0 && usedHeight + next.height > availableHeight) {
      break
    }

    visible.push(next)
    usedHeight += next.height
  }

  return visible
}

function buildColumns(columns: TableColumn[], totalWidth: number): number[] {
  const defaultWidth = Math.max(6, Math.floor(totalWidth / columns.length))
  const widths = columns.map((column) => column.width ?? defaultWidth)
  const sum = widths.reduce((accumulator, value) => accumulator + value, 0)

  if (sum <= totalWidth) {
    return widths
  }

  const ratio = totalWidth / sum

  return widths.map((width) => Math.max(4, Math.floor(width * ratio)))
}

function Table({
  title, columns, rows, maxRows, width,
}: TableProps) {
  const totalWidth = Math.max(20, (width ?? 80) - (columns.length - 1) * 2)
  const columnWidths = buildColumns(columns, totalWidth)
  const visibleRows = maxRows
    ? rows.slice(0, maxRows)
    : rows

  const header = columns
    .map((column, index) => padCell(column.label, columnWidths[index], "left"))
    .join("  ")

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.secondary}
      paddingX={1}
      paddingY={0}
    >
      <Text
        color={theme.secondary}
        bold
      >
        {title}
      </Text>

      <Text
        color={theme.accent}
        bold
      >
        {header}
      </Text>

      {visibleRows.length === 0
        ? (
            <Text
              dimColor
              color={theme.text}
            >
              (no data)
            </Text>
          )
        : (
            visibleRows.map((row, rowIndex) => (
              <Text
                key={`${title}-${rowIndex}`}
                color={theme.text}
                wrap="truncate"
              >
                {row.map((cell, cellIndex) => padCell(cell, columnWidths[cellIndex], columns[cellIndex]?.align ?? "left"))
                  .join("  ")}
              </Text>
            ))
          )}
    </Box>
  )
}

function HelpOverlay({ size }: { size: Size }) {
  const width = Math.min(size.columns - 6, 76)

  return (
    <Box
      position="absolute"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        width={width}
        borderStyle="double"
        borderColor={theme.accent}
        backgroundColor={theme.background}
        padding={1}
        flexDirection="column"
      >
        <Text
          color={theme.accent}
          bold
        >
          Help
        </Text>

        <Text color={theme.text}>Navigation : 1 Overview  2 Filters  3 Drilldown  r Refresh  q Quit  ? Help</Text>

        <Text color={theme.text}>Overview : ↑/↓ scroll sections  PageUp/PageDown jump</Text>

        <Text color={theme.text}>Drilldown : ↑/↓ move  PageUp/PageDown jump  / Search  Esc clear search</Text>

        <Text color={theme.text}>Filters : f from  t to  e env  s service  k kind  o outcome  h status  a action  d duration  x clear</Text>

        <Text color={theme.text}>Tips : duration stats respect --duration-kind. Resize the terminal to adjust layout.</Text>
      </Box>
    </Box>
  )
}

function LogTuiApp({ options }: { options: TuiOptions }) {
  const { exit } = useApp()
  const { stdout } = useStdout()

  const [ size, setSize ] = useState<Size>({
    columns: stdout.columns ?? 120,
    rows: stdout.rows ?? 40,
  })
  const [ tab, setTab ] = useState<Tab>("overview")
  const [ parseResult, setParseResult ] = useState<ParseResult | null>(null)
  const [ filters, setFilters ] = useState<Filters>(() => ({
    ...options.filters,
    durationKind: options.filters.durationKind ?? "request",
  }))
  const [ loading, setLoading ] = useState(true)
  const [ error, setError ] = useState<string | null>(null)
  const [ searchQuery, setSearchQuery ] = useState<string | undefined>(undefined)
  const [ selectedIndex, setSelectedIndex ] = useState(0)
  const [ prompt, setPrompt ] = useState<PromptState | null>(null)
  const [ promptValue, setPromptValue ] = useState("")
  const [ showHelp, setShowHelp ] = useState(false)
  const [ overviewScroll, setOverviewScroll ] = useState(0)
  const [ drilldownFocus, setDrilldownFocus ] = useState<DrilldownFocus>("events")
  const [ detailScroll, setDetailScroll ] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setSize({
        columns: stdout.columns ?? 120,
        rows: stdout.rows ?? 40,
      })
    }

    stdout.on("resize", handleResize)
    enableMouseTracking()

    return () => {
      stdout.off("resize", handleResize)
      disableMouseTracking()
    }
  }, [stdout])

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await readLogRecords({ file: options.file })

      setParseResult(result)
    } catch (loadError) {
      const message = loadError instanceof Error
        ? loadError.message
        : "Failed to read log file"

      setError(message)
    } finally {
      setLoading(false)
    }
  }, [options.file])

  useEffect(() => {
    void loadLogs()
  }, [loadLogs])

  useEffect(() => {
    if (prompt) {
      setPromptValue(prompt.initial ?? "")
    }
  }, [prompt])

  const filtered = useMemo(() => {
    if (!parseResult) {
      return null
    }

    return filterRecords(parseResult.records, filters)
  }, [ parseResult, filters ])

  const report = useMemo<Report | null>(() => {
    if (!parseResult || !filtered) {
      return null
    }

    return buildReport(
      parseResult,
      filtered,
      filters,
      filters.durationKind ?? "request",
      {
        file: options.file, stdin: false,
      },
    )
  }, [ parseResult, filtered, filters, options.file ])

  const displayRecords = useMemo(() => {
    if (!filtered) {
      return [] as EventRecord[]
    }

    if (!searchQuery) {
      return filtered.records
    }

    const lowered = searchQuery.toLowerCase()

    return filtered.records.filter((record) => JSON.stringify(record.event)
      .toLowerCase()
      .includes(lowered))
  }, [ filtered, searchQuery ])

  const drilldownLayout = useMemo(() => getDrilldownLayout(size), [size])
  const currentDetailLines = useMemo(
    () => buildDetailLines(displayRecords[selectedIndex], drilldownLayout.detailWidth),
    [ displayRecords, selectedIndex, drilldownLayout.detailWidth ],
  )
  const maxDetailScroll = Math.max(0, currentDetailLines.length - drilldownLayout.innerDetailRows)

  const overviewSections = useMemo(
    () => (report
      ? buildOverviewSections(report, size)
      : []),
    [ report, size ],
  )
  const overviewAvailableHeight = Math.max(6, size.rows - 6)
  const maxOverviewScroll = Math.max(0, overviewSections.length - 1)

  useEffect(() => {
    if (!stdin.isTTY) {
      return undefined
    }

    const handleMouseData = (data: Buffer | string) => {
      if (prompt || showHelp) {
        return
      }

      const text = typeof data === "string"
        ? data
        : data.toString("utf8")
      const direction = getMouseScrollDirection(text)

      if (direction === 0) {
        return
      }

      if (tab === "overview") {
        setOverviewScroll((current) => {
          const next = current + direction

          return Math.max(0, Math.min(maxOverviewScroll, next))
        })

        return
      }

      if (tab === "drilldown") {
        if (drilldownFocus === "details") {
          setDetailScroll((current) => {
            const next = current + direction

            return Math.max(0, Math.min(maxDetailScroll, next))
          })
        } else {
          setSelectedIndex((current) => {
            const next = current + direction

            return Math.max(0, Math.min(displayRecords.length - 1, next))
          })
        }
      }
    }

    stdin.on("data", handleMouseData)

    return () => {
      stdin.off("data", handleMouseData)
    }
  }, [ prompt, showHelp, tab, drilldownFocus, maxOverviewScroll, maxDetailScroll, displayRecords.length ])

  useEffect(() => {
    setSelectedIndex((current) => Math.min(current, Math.max(0, displayRecords.length - 1)))
  }, [displayRecords.length])

  useEffect(() => {
    setDetailScroll(0)
  }, [selectedIndex])

  useEffect(() => {
    setDetailScroll((current) => Math.min(current, maxDetailScroll))
  }, [maxDetailScroll])

  useEffect(() => {
    setOverviewScroll((current) => Math.min(current, maxOverviewScroll))
  }, [maxOverviewScroll])

  useEffect(() => {
    if (tab === "overview") {
      setOverviewScroll(0)
    }
  }, [ filters, tab ])

  useInput((input, key) => {
    if (prompt) {
      if (key.escape) {
        setPrompt(null)
      }

      return
    }

    if (showHelp) {
      if (input === "?" || key.escape) {
        setShowHelp(false)
      }

      return
    }

    if (input === "q" || (key.ctrl && input === "c")) {
      exit()

      return
    }

    if (input === "?") {
      setShowHelp(true)

      return
    }

    if (input === "1") {
      setTab("overview")

      return
    }

    if (input === "2") {
      setTab("filters")

      return
    }

    if (input === "3") {
      setTab("drilldown")

      return
    }

    if (input === "r") {
      void loadLogs()

      return
    }

    if (tab === "drilldown") {
      if (key.tab) {
        setDrilldownFocus((current) => (current === "events"
          ? "details"
          : "events"))

        return
      }

      if (key.upArrow) {
        if (drilldownFocus === "details") {
          setDetailScroll((current) => Math.max(0, current - 1))
        } else {
          setSelectedIndex((current) => Math.max(0, current - 1))
        }

        return
      }

      if (key.downArrow) {
        if (drilldownFocus === "details") {
          setDetailScroll((current) => Math.min(maxDetailScroll, current + 1))
        } else {
          setSelectedIndex((current) => Math.min(displayRecords.length - 1, current + 1))
        }

        return
      }

      if (key.pageUp) {
        if (drilldownFocus === "details") {
          setDetailScroll((current) => Math.max(0, current - 10))
        } else {
          setSelectedIndex((current) => Math.max(0, current - 10))
        }

        return
      }

      if (key.pageDown) {
        if (drilldownFocus === "details") {
          setDetailScroll((current) => Math.min(maxDetailScroll, current + 10))
        } else {
          setSelectedIndex((current) => Math.min(displayRecords.length - 1, current + 10))
        }

        return
      }

      if (key.escape) {
        setSearchQuery(undefined)

        return
      }

      if (input === "/") {
        setPrompt({
          label: "Search",
          initial: searchQuery,
          onSubmit: (value) => {
            setSearchQuery(value)
          },
        })
      }
    }

    if (tab === "filters") {
      handleFilterKey(input, filters, setFilters, setPrompt)
    }

    if (tab === "overview") {
      if (key.upArrow) {
        setOverviewScroll((current) => Math.max(0, current - 1))

        return
      }

      if (key.downArrow) {
        setOverviewScroll((current) => Math.min(maxOverviewScroll, current + 1))

        return
      }

      if (key.pageUp) {
        setOverviewScroll((current) => Math.max(0, current - 3))
      }

      if (key.pageDown) {
        setOverviewScroll((current) => Math.min(maxOverviewScroll, current + 3))
      }
    }
  })

  const header = `Spendly Log TUI  |  ${options.file}  |  ${formatNumber(displayRecords.length)} events`
  const headerRight = tab === "overview" && overviewSections.length > 1
    ? `Scroll ${overviewScroll + 1}/${overviewSections.length}`
    : ""
  const footer = buildFooter(tab, showHelp)
  const presets = useMemo(() => (parseResult
    ? buildFilterPresets(parseResult.records)
    : emptyFilterPresets()), [parseResult])

  return (
    <Box
      flexDirection="column"
      height={size.rows}
      width={size.columns}
      backgroundColor={theme.background}
    >
      <Box
        backgroundColor={theme.primary}
        paddingX={1}
      >
        <Box
          flexDirection="row"
          width="100%"
          justifyContent="space-between"
        >
          <Text
            color={theme.background}
            bold
          >
            {header}
          </Text>

          {headerRight
            ? (
                <Text
                  color={theme.background}
                  bold
                >
                  {headerRight}
                </Text>
              )
            : null
          }
        </Box>
      </Box>

      <Box
        flexDirection="column"
        flexGrow={1}
        paddingX={1}
        paddingY={1}
      >
        {loading
          ? (
              <Text color={theme.warning}>Loading logs...</Text>
            )
          : error
            ? (
                <Text color={theme.error}>{error}</Text>
              )
            : report
              ? (
                  <>
                    {tab === "overview" && (
                      <OverviewView
                        report={report}
                        scroll={overviewScroll}
                        sections={overviewSections}
                        availableHeight={overviewAvailableHeight}
                      />
                    )}

                    {tab === "filters" && (
                      <FiltersView
                        filters={filters}
                        presets={presets}
                        size={size}
                      />
                    )}

                    {tab === "drilldown" && (
                      <DrilldownView
                        records={displayRecords}
                        selectedIndex={selectedIndex}
                        size={size}
                        focus={drilldownFocus}
                        detailLines={currentDetailLines}
                        detailScroll={detailScroll}
                      />
                    )}
                  </>
                )
              : null
        }
      </Box>

      <Box
        backgroundColor={theme.secondary}
        paddingX={1}
      >
        <Text color={theme.background}>{footer}</Text>
      </Box>

      {prompt && (
        <PromptOverlay
          label={prompt.label}
          value={promptValue}
          onChange={setPromptValue}
          onSubmit={(value) => {
            prompt.onSubmit(value)
            setPrompt(null)
          }}
          onCancel={() => setPrompt(null)}
          size={size}
        />
      )}

      {showHelp && <HelpOverlay size={size} />}
    </Box>
  )
}

function buildFooter(tab: Tab, showHelp: boolean): string {
  if (showHelp) {
    return "Press ? to close help"
  }

  if (tab === "filters") {
    return "1 Overview  2 Filters  3 Drilldown  f/t/e/s/k/o/h/a/d/x edit  r Refresh  ? Help  q Quit"
  }

  if (tab === "drilldown") {
    return "1 Overview  2 Filters  3 Drilldown  Tab focus  ↑/↓ move  / Search  Esc clear  r Refresh  ? Help  q Quit"
  }

  return "1 Overview  2 Filters  3 Drilldown  ↑/↓ scroll  r Refresh  ? Help  q Quit"
}

function handleFilterKey(
  input: string,
  filters: Filters,
  setFilters: React.Dispatch<React.SetStateAction<Filters>>,
  setPrompt: React.Dispatch<React.SetStateAction<PromptState | null>>,
): void {
  const openPrompt = (label: string, initial: string | undefined, onSubmit: (value?: string) => void) => {
    setPrompt({
      label,
      initial,
      onSubmit,
    })
  }

  switch (input) {
    case "f":
      openPrompt("From (ISO)", filters.from
        ? new Date(filters.from)
            .toISOString()
        : undefined, (value) => {
        setFilters((current) => ({
          ...current,
          from: value
            ? Date.parse(value)
            : undefined,
        }))
      })

      break
    case "t":
      openPrompt("To (ISO)", filters.to
        ? new Date(filters.to)
            .toISOString()
        : undefined, (value) => {
        setFilters((current) => ({
          ...current,
          to: value
            ? Date.parse(value)
            : undefined,
        }))
      })

      break
    case "e":
      openPrompt("Env", filters.env, (value) => {
        setFilters((current) => ({
          ...current, env: value,
        }))
      })

      break
    case "s":
      openPrompt("Service", filters.service, (value) => {
        setFilters((current) => ({
          ...current, service: value,
        }))
      })

      break
    case "k":
      openPrompt("Kind", filters.kind, (value) => {
        setFilters((current) => ({
          ...current, kind: value,
        }))
      })

      break
    case "o":
      openPrompt("Outcome", filters.outcome, (value) => {
        setFilters((current) => ({
          ...current, outcome: value,
        }))
      })

      break
    case "h":
      openPrompt("Status", filters.status?.toString(), (value) => {
        setFilters((current) => ({
          ...current,
          status: value
            ? Number(value)
            : undefined,
        }))
      })

      break
    case "a":
      openPrompt("Action prefix", filters.actionPrefix, (value) => {
        setFilters((current) => ({
          ...current, actionPrefix: value,
        }))
      })

      break
    case "d":
      openPrompt("Duration kind (request/ui/system)", filters.durationKind ?? "request", (value) => {
        const normalized = normalizeDurationKind(value)

        setFilters((current) => ({
          ...current,
          durationKind: normalized === "__invalid__"
            ? current.durationKind
            : normalized ?? "request",
        }))
      })

      break
    case "x":
      setFilters({ durationKind: filters.durationKind })

      break
    default:
      break
  }
}

function OverviewView({
  report,
  scroll,
  sections,
  availableHeight,
}: {
  report: Report;
  scroll: number;
  sections: OverviewSection[];
  availableHeight: number;
}) {
  const visibleSections = useMemo(
    () => getVisibleSections(sections, scroll, availableHeight),
    [ sections, scroll, availableHeight ],
  )

  if (!report) {
    return null
  }

  return (
    <Box
      flexDirection="column"
      gap={1}
    >
      {visibleSections.map((section) => (
        <Box key={section.id}>
          {section.node}
        </Box>
      ))}
    </Box>
  )
}

function FiltersView({
  filters, presets, size,
}: {
  filters: Filters; presets: FilterPresets; size: Size;
}) {
  const tableWidth = Math.max(24, Math.floor((size.columns - 4) / 3))
  const lineOne = `from : ${formatTimestamp(filters.from)}  to : ${formatTimestamp(filters.to)}  env : ${filters.env ?? "—"}  service : ${filters.service ?? "—"}  kind : ${filters.kind ?? "—"}`
  const lineTwo = `outcome : ${filters.outcome ?? "—"}  status : ${filters.status?.toString() ?? "—"}  action-prefix : ${filters.actionPrefix ?? "—"}  duration-kind : ${filters.durationKind ?? "request"}`

  return (
    <Box
      flexDirection="column"
      gap={1}
    >
      <Box
        borderStyle="round"
        borderColor={theme.secondary}
        paddingX={1}
        flexDirection="column"
        width="100%"
      >
        <Text
          color={theme.secondary}
          bold
        >
          Active filters
        </Text>

        <Text color={theme.text}>{lineOne}</Text>

        <Text color={theme.text}>{lineTwo}</Text>
      </Box>

      <Box
        flexDirection="row"
        gap={1}
      >
        <Table
          title="Env"
          columns={[
            {
              label: "env", width: 16,
            }, {
              label: "count", width: 6, align: "right",
            },
          ]}
          rows={tableRowsFromRecord(presets.env)}
          maxRows={6}
          width={tableWidth}
        />

        <Table
          title="Service"
          columns={[
            {
              label: "service", width: 18,
            }, {
              label: "count", width: 6, align: "right",
            },
          ]}
          rows={tableRowsFromRecord(presets.service)}
          maxRows={6}
          width={tableWidth}
        />

        <Table
          title="Kind"
          columns={[
            {
              label: "kind", width: 12,
            }, {
              label: "count", width: 6, align: "right",
            },
          ]}
          rows={tableRowsFromRecord(presets.kind)}
          maxRows={6}
          width={tableWidth}
        />
      </Box>

      <Box
        flexDirection="row"
        gap={1}
      >
        <Table
          title="Outcome"
          columns={[
            {
              label: "outcome", width: 14,
            }, {
              label: "count", width: 6, align: "right",
            },
          ]}
          rows={tableRowsFromRecord(presets.outcome)}
          maxRows={6}
          width={tableWidth}
        />

        <Table
          title="Status"
          columns={[
            {
              label: "status", width: 10,
            }, {
              label: "count", width: 6, align: "right",
            },
          ]}
          rows={tableRowsFromRecord(presets.status)}
          maxRows={6}
          width={tableWidth}
        />

        <Table
          title="UI actions"
          columns={[
            {
              label: "action", width: 20,
            }, {
              label: "count", width: 6, align: "right",
            },
          ]}
          rows={tableRowsFromRecord(presets.action)}
          maxRows={6}
          width={tableWidth}
        />
      </Box>

      <Box
        borderStyle="round"
        borderColor={theme.accent}
        paddingX={1}
        flexDirection="column"
      >
        <Box flexDirection="column">
          <Text
            color={theme.accent}
            bold
          >
            Commands
          </Text>

          <Text color={theme.text}>f from  t to  e env  s service  k kind  o outcome</Text>

          <Text color={theme.text}>h status  a action prefix  d duration kind  x clear</Text>
        </Box>
      </Box>
    </Box>
  )
}

function DrilldownView({
  records,
  selectedIndex,
  size,
  focus,
  detailLines,
  detailScroll,
}: {
  records: EventRecord[];
  selectedIndex: number;
  size: Size;
  focus: DrilldownFocus;
  detailLines: string[];
  detailScroll: number;
}) {
  const {
    panelHeight, listWidth, detailWidth, innerListRows, innerDetailRows,
  } = getDrilldownLayout(size)

  const startIndex = Math.max(0, selectedIndex - Math.floor(innerListRows / 2))
  const visible = records.slice(startIndex, startIndex + innerListRows)
  const detailStart = Math.max(0, Math.min(detailScroll, Math.max(0, detailLines.length - innerDetailRows)))

  return (
    <Box
      flexDirection="row"
      gap={1}
    >
      <Box
        flexDirection="column"
        width={listWidth}
        flexShrink={0}
      >
        <Box
          borderStyle="round"
          borderColor={focus === "events"
            ? theme.accent
            : theme.secondary}
          paddingX={1}
          flexDirection="column"
          width={listWidth}
          height={panelHeight}
        >
          <Text
            color={theme.secondary}
            bold
          >
            Events ({records.length})
          </Text>

          {visible.length === 0
            ? (
                <Text
                  dimColor
                  color={theme.text}
                >
                  No events
                </Text>
              )
            : (
                visible.map((record, index) => {
                  const absoluteIndex = startIndex + index
                  const isSelected = absoluteIndex === selectedIndex
                  const label = buildRecordLabel(record)
                  const line = truncate(label, listWidth - 6)

                  return (
                    <Box
                      key={`${record.line}-${record.event.ts}`}
                      width={listWidth - 2}
                      flexDirection="row"
                    >
                      <Text
                        color={isSelected
                          ? theme.background
                          : theme.text}
                        backgroundColor={isSelected
                          ? theme.accent
                          : undefined}
                        wrap="truncate"
                      >
                        {isSelected
                          ? "> "
                          : "  "}{line}
                      </Text>
                    </Box>
                  )
                })
              )}
        </Box>
      </Box>

      <Box
        flexDirection="column"
        width={detailWidth}
        flexShrink={0}
      >
        <Box
          borderStyle="round"
          borderColor={focus === "details"
            ? theme.accent
            : theme.secondary}
          paddingX={1}
          flexDirection="column"
          width={detailWidth}
          height={panelHeight}
        >
          <Text
            color={theme.accent}
            bold
          >
            Details
          </Text>

          {detailLines.slice(detailStart, detailStart + innerDetailRows)
            .map((line, index) => (
              <Text
                key={`${detailStart + index}`}
                color={theme.text}
                wrap="truncate"
              >
                {line}
              </Text>
            ))}
        </Box>
      </Box>
    </Box>
  )
}

function buildRecordLabel(record: EventRecord): string {
  const event = record.event
  const label = event.op?.name ?? event.ui?.action ?? event.http?.path ?? "-"
  const outcome = event.outcome ?? "-"
  const path = event.http?.path ?? event.ui?.route ?? ""

  return `${event.ts} | ${event.kind} | ${outcome} | ${label} | ${path}`
}

function tableRowsFromRecord(record: Record<string, number>, limit = 8): string[][] {
  return Object.entries(record)
    .toSorted((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ key, value ]) => [ key, formatNumber(value) ])
}

function PromptOverlay({
  label,
  value,
  onChange,
  onSubmit,
  onCancel,
  size,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value?: string) => void;
  onCancel: () => void;
  size: Size;
}) {
  const width = Math.min(size.columns - 6, 70)

  useInput((_input, key) => {
    if (key.escape) {
      onCancel()
    }
  })

  return (
    <Box
      position="absolute"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        width={width}
        borderStyle="double"
        borderColor={theme.accent}
        backgroundColor={theme.background}
        padding={1}
        flexDirection="column"
      >
        <Text
          color={theme.accent}
          bold
        >
          {label}
        </Text>

        <TextInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
        />

        <Text
          dimColor
          color={theme.text}
        >
          Enter to confirm · Esc to cancel
        </Text>
      </Box>
    </Box>
  )
}

function buildFilterPresets(records: EventRecord[]): FilterPresets {
  const env = new Map<string, number>()
  const service = new Map<string, number>()
  const kind = new Map<string, number>()
  const outcome = new Map<string, number>()
  const status = new Map<string, number>()
  const action = new Map<string, number>()

  for (const record of records) {
    const event = record.event

    incPreset(env, event.env)
    incPreset(service, event.service)
    incPreset(kind, event.kind)
    incPreset(outcome, event.outcome)
    incPreset(status, event.http?.status_code?.toString())
    incPreset(action, event.ui?.action)
  }

  return {
    env: topPreset(env),
    service: topPreset(service),
    kind: topPreset(kind),
    outcome: topPreset(outcome),
    status: topPreset(status),
    action: topPreset(action),
  }
}

function emptyFilterPresets(): FilterPresets {
  return {
    env: {},
    service: {},
    kind: {},
    outcome: {},
    status: {},
    action: {},
  }
}

function incPreset(map: Map<string, number>, value?: string): void {
  if (!value) {
    return
  }

  map.set(value, (map.get(value) ?? 0) + 1)
}

function topPreset(map: Map<string, number>, limit = 6): Record<string, number> {
  const sorted = [...map.entries()].toSorted((a, b) => b[1] - a[1])
    .slice(0, limit)
  const record: Record<string, number> = {}

  for (const [ key, value ] of sorted) {
    record[key] = value
  }

  return record
}

function cleanupTerminal(): void {
  if (!process.stdout.isTTY) {
    return
  }

  disableMouseTracking()
  process.stdout.write("\u001b[0m")
  process.stdout.write("\u001b[?25h")
  process.stdout.write("\u001b[2J\u001b[H")
}

function main(): void {
  const options = parseArgs(process.argv.slice(2))

  if (!options) {
    printHelp()
    process.exitCode = 1

    return
  }

  const normalizedDurationKind = normalizeDurationKind(options.filters.durationKind)

  if (normalizedDurationKind === "__invalid__") {
    console.error("Invalid --duration-kind. Use : request, ui, system.")
    process.exitCode = 1

    return
  }

  options.filters.durationKind = normalizedDurationKind ?? "request"

  if (!stdin.isTTY) {
    console.error("The log TUI requires a TTY. Use pnpm log:analyze for non-interactive runs.")
    process.exitCode = 1

    return
  }

  const app = render(<LogTuiApp options={options} />, {
    exitOnCtrlC: true,
    incrementalRendering: true,
    maxFps: 60,
  })

  void app.waitUntilExit()
    .then(() => {
      cleanupTerminal()
    })
    .catch(() => {
      cleanupTerminal()
    })
}

main()

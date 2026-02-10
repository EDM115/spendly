import { db } from "#shared/db/drizzle"
import { requireUserId } from "#server/utils/session"
import { addWide } from "#server/utils/wide"

import fs from "node:fs/promises"
import path from "node:path"

import { exec } from "node:child_process"
import { promisify } from "node:util"

const execAsync = promisify(exec)

export default defineEventHandler(async (event) => {
  if (event.method !== "GET") {
    throw createError({
      status: 405,
      message: "Method not allowed",
    })
  }

  const auth = event.context.auth

  requireUserId(auth)

  if (auth?.role !== "admin") {
    throw createError({
      status: 403,
      message: "Admin access required",
    })
  }

  const { format } = getQuery(event)
  const requestedFormat = typeof format === "string"
    ? format
    : undefined
  const supportedFormats = new Set([ "csv", "json", "sql", "sqlite" ])

  if (requestedFormat && !supportedFormats.has(requestedFormat)) {
    throw createError({
      status: 400,
      message: "Invalid export format",
    })
  }

  const exportFormat = requestedFormat ?? "csv"
  const timestamp = Date.now()
  const dateYMD = new Date()
    .toISOString()
    .split("T")[0]
  const tempDir = path.join(process.cwd(), "temp")

  await fs.mkdir(tempDir, { recursive: true })
  const tables = [ "user", "session", "account", "verification", "user_requests", "budget_tracker", "user_budget_tracker", "category", "spending" ]

  if (exportFormat === "sql") {
    const dumpPath = path.join(tempDir, `backup_${timestamp}.sql`)

    try {
      await execAsync(`sqlite3 "${db.$client.name}" .dump > "${dumpPath}"`)

      const fileContent = await fs.readFile(dumpPath)

      addWide(event, {
        op: {
          name: "admin.dbExport",
          entity: "database",
        },
        meta: {
          format: exportFormat,
        },
      })

      return {
        body: fileContent.toString("base64"),
        filename: `spendly-backup-${dateYMD}.sql`,
      }
    } finally {
      await fs.rm(dumpPath, { force: true })
    }
  } else if (exportFormat === "sqlite") {
    const dbCopyPath = path.join(tempDir, `backup_${timestamp}.db`)

    try {
      await fs.copyFile(db.$client.name, dbCopyPath)

      const fileContent = await fs.readFile(dbCopyPath)

      addWide(event, {
        op: {
          name: "admin.dbExport",
          entity: "database",
        },
        meta: {
          format: exportFormat,
        },
      })

      return {
        body: fileContent.toString("base64"),
        filename: `spendly-backup-${dateYMD}.db`,
      }
    } finally {
      await fs.rm(dbCopyPath, { force: true })
    }
  } else if (exportFormat === "json") {
    const outputPaths: string[] = []

    try {
      const jsonResults = await Promise.all(tables.map(async (table) => {
        const outputPath = path.join(tempDir, `${table}_${timestamp}.json`)

        outputPaths.push(outputPath)
        await execAsync(`sqlite3 -json "${db.$client.name}" "SELECT * FROM ${table};" > "${outputPath}"`)

        const content = await fs.readFile(outputPath, "utf-8")
        const safeContent = content.trim() === ""
          ? "[]"
          : content

        return {
          table,
          // oxlint-disable-next-line no-unsafe-type-assertion
          data: JSON.parse(safeContent) as unknown[],
        }
      }))

      const dataObj: Record<string, unknown[]> = {}

      for (const {
        table, data,
      } of jsonResults) {
        dataObj[table] = data
      }

      const jsonString = JSON.stringify(dataObj, null, 2)

      addWide(event, {
        op: {
          name: "admin.dbExport",
          entity: "database",
        },
        meta: {
          format: exportFormat,
        },
      })

      return {
        body: Buffer.from(jsonString)
          .toString("base64"),
        filename: `spendly-backup-${dateYMD}.json`,
      }
    } finally {
      await Promise.all(outputPaths.map((outputPath) => fs.rm(outputPath, { force: true })))
    }
  } else {
    const outputPaths: string[] = []

    try {
      const csvData = await Promise.all(tables.map(async (table) => {
        const outputPath = path.join(tempDir, `${table}_${timestamp}.csv`)

        outputPaths.push(outputPath)
        await execAsync(`sqlite3 -header -csv "${db.$client.name}" "SELECT * FROM ${table};" > "${outputPath}"`)
        const content = await fs.readFile(outputPath, "utf-8")

        return `-- ${table} --\n${content}`
      }))

      addWide(event, {
        op: {
          name: "admin.dbExport",
          entity: "database",
        },
        meta: {
          format: exportFormat,
        },
      })

      return {
        body: Buffer.from(csvData.join("\n"))
          .toString("base64"),
        filename: `spendly-backup-${dateYMD}.csv`,
      }
    } finally {
      await Promise.all(outputPaths.map((outputPath) => fs.rm(outputPath, { force: true })))
    }
  }
})

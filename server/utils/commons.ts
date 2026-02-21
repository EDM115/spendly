import type { H3Event } from "h3"

import { randomUUID } from "node:crypto"

export type LogEnv = "production" | "staging" | "development"

export function resolveEnv(): LogEnv {
  const stage = process.env.STAGE?.toLowerCase()

  if (stage === "production" || stage === "staging" || stage === "development") {
    return stage
  }

  return process.env.NODE_ENV === "production"
    ? "production"
    : "development"
}

export function resolveRequestId(event: H3Event): string {
  const existing = getRequestHeader(event, "x-request-id")

  return existing ?? randomUUID()
}

export const envConfig = {
  env: resolveEnv(),
  level: process.env.LOG_LEVEL ?? "info",
  service: process.env.SERVICE_NAME ?? "spendly",
  version: process.env.SERVICE_VERSION ?? process.env.npm_package_version ?? "unknown",
}

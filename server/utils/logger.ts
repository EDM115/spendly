// oxlint-disable-next-line import/no-unassigned-import
import "pino-pretty"

import pino from "pino"

import { envConfig } from "#server/utils/commons"
import { isFeatureDisabled } from "#shared/utils/disabledFeatures"

const redactPaths = [
  "authorization",
  "cookie",
  "password",
  "token",
  "access_token",
  "refresh_token",
  "session",
  "secret",
  "apiKey",
  "headers.authorization",
  "headers.cookie",
  "headers['x-captcha-response']",
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers['x-captcha-response']",
]

const transport = envConfig.env === "development" && process.stdout.isTTY
  ? {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    }
  : {}

export const logger = pino({
  enabled: !isFeatureDisabled("logs"),
  level: envConfig.level,
  base: {
    service: envConfig.service,
    env: envConfig.env,
    version: envConfig.version,
  },
  redact: {
    paths: redactPaths,
    censor: "[Redacted]",
  },
  formatters: {
    bindings: () => ({}),
  },
  timestamp: () => `,"ts":"${new Date()
    .toISOString()}"`,
  ...transport,
})

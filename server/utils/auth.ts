import { db } from "#shared/db/drizzle"
import { schema } from "#shared/db/schema"
import { sendEmail } from "#server/utils/email"
import { logger } from "#server/utils/logger"

import type { ErrorContext } from "@better-fetch/fetch"

import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { betterAuth } from "better-auth/minimal"
import {
  admin,
  captcha,
  lastLoginMethod,
  magicLink,
  username,
} from "better-auth/plugins"

export const auth = betterAuth({
  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },
  },
  advanced: {
    cookiePrefix: "spendly",
  },
  appName: "Spendly",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    onPasswordReset: async ({ user }, _request) => {
      logger.info({
        kind: "system",
        op: {
          name: "auth.password.reset",
          entity: "user",
          entity_id: user.id,
        },
        outcome: "success",
      })
    },
    maxPasswordLength: 16384,
    sendResetPassword: async ({
      user, url, token: _token,
    }, _request) => {
      logger.info({
        kind: "system",
        op: {
          name: "auth.password.reset.send",
          entity: "user",
          entity_id: user.id,
        },
        outcome: "success",
        meta: {
          template: "password-reset",
        },
      })

      void sendEmail(
        user.email,
        {
          template: "password-reset",
          variables: {
            account_name: user.name,
            reset_link: url,
            spendly_home: process.env.BETTER_AUTH_URL!,
          },
        }
      )
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({
      user, url, token: _token,
    }, _request) => {
      logger.info({
        kind: "system",
        op: {
          name: "auth.email.verify.send",
          entity: "user",
          entity_id: user.id,
        },
        outcome: "success",
        meta: {
          template: "verify-email",
        },
      })

      void sendEmail(
        user.email,
        {
          template: "verify-email",
          variables: {
            account_name: user.name,
            verify_link: url,
            spendly_home: process.env.BETTER_AUTH_URL!,
          },
        }
      )
    },
  },
  experimental: { joins: false },
  fetchOptions: {
    onError: async (context: ErrorContext) => {
      const { response } = context

      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After")

        logger.warn({
          kind: "system",
          op: {
            name: "auth.rate_limit",
            entity: "auth",
          },
          outcome: "error",
          meta: {
            retry_after: retryAfter ?? undefined,
          },
        })
      }
    },
  },
  plugins: [
    admin(),
    captcha({
      endpoints: [
        "/sign-up/email",
        "/sign-in/email",
        "/sign-in/username",
        "/request-password-reset",
      ],
      provider: "cloudflare-turnstile",
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
    }),
    lastLoginMethod({
      cookieName: "spendly.last_used_login_method",
      customResolveMethod: (ctx) => {
        if (ctx.path === "/sign-in/username") {
          return "username"
        }

        if (ctx.path === "/magic-link/verify") {
          return "magic-link"
        }

        // Return null to use default resolution
        return null
      },
      storeInDatabase: true,
    }),
    magicLink({
      expiresIn: 60 * 10,
      sendMagicLink: async ({
        email, url, token: _token,
      }, _ctx) => {
        logger.info({
          kind: "system",
          op: {
            name: "auth.magic_link.send",
            entity: "user",
          },
          outcome: "success",
          meta: {
            template: "magic-link",
          },
        })

        void sendEmail(
          email,
          {
            template: "magic-link",
            variables: {
              account_email: email,
              connect_link: url,
              spendly_home: process.env.BETTER_AUTH_URL!,
            },
          },
        )
      },
    }),
    username({
      maxUsernameLength: 128,
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 30,
      strategy: "jwt",
    },
    expiresIn: 60 * 60 * 24,
    freshAge: 60 * 60 * 2,
    updateAge: 60 * 60 * 6,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
  },
  trustedOrigins: [ process.env.BETTER_AUTH_URL!, "https://spendly.edm115.dev" ],
  user: {
    changeEmail: {
      enabled: true,
    },
  },
})

export default auth

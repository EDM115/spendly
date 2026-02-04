import { db } from "#shared/db/drizzle"
import { schema } from "#shared/db/schema"
// import { sendEmail } from "#server/utils/email"

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
    onPasswordReset: async ({ user }, request) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`)
    },
    maxPasswordLength: 16384,
    sendResetPassword: async ({
      user, url, token,
    }, request) => {
      /* void sendEmail(
        user.email,
        "Reset your password",
        `Click the link to reset your password: ${url}`,
      ) */
    },
  },
  experimental: { joins: false },
  fetchOptions: {
    onError: async (context: ErrorContext) => {
      const { response } = context

      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After")

        console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`)
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
      storeInDatabase: true,
    }),
    magicLink({
      expiresIn: 60 * 10,
      sendMagicLink: async ({
        email, token, url,
      }, ctx) => {
        // send email to user
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
})

export default auth

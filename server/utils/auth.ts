import { db } from "#shared/db/drizzle"
import { schema } from "#shared/db/schema"
// import { sendEmail } from "#server/utils/email"

import type { ErrorContext } from "@better-fetch/fetch"

import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { betterAuth } from "better-auth/minimal"
import {
  admin,
  captcha,
  emailOTP,
  lastLoginMethod,
  magicLink,
  username,
} from "better-auth/plugins"

export const auth = betterAuth({
  appName: "Spendly",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  experimental: { joins: false },
  advanced: {
    cookiePrefix: "spendly",
  },
  account: {
    accountLinking: {
      allowDifferentEmails: true,
    },
  },
  trustedOrigins: [ process.env.BETTER_AUTH_URL!, "https://spendly.edm115.dev" ],
  emailAndPassword: {
    enabled: true,
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
    onPasswordReset: async ({ user }, request) => {
      // your logic here
      console.log(`Password for user ${user.email} has been reset.`)
    },
  },
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 6,
    freshAge: 60 * 60 * 2,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 30,
      strategy: "jwt",
    },
  },
  plugins: [
    admin(),
    captcha({
      provider: "cloudflare-turnstile",
      secretKey: process.env.TURNSTILE_SECRET_KEY!,
      endpoints: [
        "/sign-up/email",
        "/sign-in/email",
        "/sign-in/username",
        "/request-password-reset",
      ],
    }),
    emailOTP({
      async sendVerificationOTP({
        email, otp, type,
      }) {
        if (type === "sign-in") {
          // Send the OTP for sign in
        } else if (type === "email-verification") {
          // Send the OTP for email verification
        } else {
          // Send the OTP for password reset
        }
      },
      otpLength: 8,
      expiresIn: 60 * 10,
    }),
    lastLoginMethod({
      storeInDatabase: true,
      cookieName: "spendly.last_used_login_method",
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
  fetchOptions: {
    onError: async (context: ErrorContext) => {
      const { response } = context

      if (response.status === 429) {
        const retryAfter = response.headers.get("X-Retry-After")

        console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`)
      }
    },
  },
})

export default auth

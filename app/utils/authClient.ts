import {
  adminClient,
  lastLoginMethodClient,
  magicLinkClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    lastLoginMethodClient({
      cookieName: "spendly.last_used_login_method",
    }),
    magicLinkClient(),
    usernameClient(),
  ],
})

export default authClient

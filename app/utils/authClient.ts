import {
  adminClient,
  emailOTPClient,
  lastLoginMethodClient,
  magicLinkClient,
  usernameClient,
} from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/vue"

export const authClient = createAuthClient({
  plugins: [
    adminClient(),
    emailOTPClient(),
    lastLoginMethodClient(),
    magicLinkClient(),
    usernameClient(),
  ],
})

export default authClient

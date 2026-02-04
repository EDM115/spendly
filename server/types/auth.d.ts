import type { AuthContext } from "#shared/types/session"

declare module "h3" {
  interface H3EventContext {
    auth?: AuthContext | null;
  }
}

declare module "h3" {
  interface H3EventContext {
    auth?: AuthContext | null;
    wide?: WideEvent;
  }
}

// oxlint-disable-next-line unicorn/require-module-specifiers
export {}

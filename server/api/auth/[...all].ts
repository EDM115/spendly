import { auth } from "#server/utils/auth"
import { addWide } from "#server/utils/wide"

function resolveAuthOp(path: string): {
  name: string;
  method?: string;
} {
  if (path.includes("/auth/admin/")) {
    if (path.includes("/list-users")) {
      return {
        name: "auth.admin.list_users",
      }
    }

    if (path.includes("/update-user")) {
      return {
        name: "auth.admin.update_user",
      }
    }

    if (path.includes("/set-role")) {
      return {
        name: "auth.admin.set_role",
      }
    }

    if (path.includes("/impersonate-user")) {
      return {
        name: "auth.admin.impersonate",
      }
    }

    if (path.includes("/stop-impersonating")) {
      return {
        name: "auth.admin.stop_impersonating",
      }
    }

    return {
      name: "auth.admin.request",
    }
  }

  if (path.includes("/sign-up")) {
    if (path.includes("/email")) {
      return {
        name: "auth.signup",
        method: "email",
      }
    }

    return {
      name: "auth.signup",
      method: "password",
    }
  }

  if (path.includes("/sign-in")) {
    if (path.includes("/username")) {
      return {
        name: "auth.login",
        method: "username",
      }
    }

    if (path.includes("/email")) {
      return {
        name: "auth.login",
        method: "email",
      }
    }

    if (path.includes("/magic-link")) {
      return {
        name: "auth.login",
        method: "magic-link",
      }
    }

    if (path.includes("/social")) {
      return {
        name: "auth.login",
        method: "oauth",
      }
    }

    return {
      name: "auth.login",
    }
  }

  if (path.includes("/oauth") || path.includes("/oauth2") || path.includes("/auth/callback")) {
    if (path.includes("/google")) {
      return {
        name: "auth.login",
        method: "google",
      }
    }

    if (path.includes("/github")) {
      return {
        name: "auth.login",
        method: "github",
      }
    }

    return {
      name: "auth.login",
      method: "oauth",
    }
  }

  if (path.includes("/sign-out")) {
    return {
      name: "auth.logout",
    }
  }

  if (path.includes("/change-email")) {
    return {
      name: "auth.email_change",
    }
  }

  if (path.includes("/change-password")) {
    return {
      name: "auth.password_change",
    }
  }

  if (path.includes("/verify-email")) {
    return {
      name: "auth.email.verify",
    }
  }

  if (path.includes("/unlink-account")) {
    return {
      name: "auth.account.unlink",
    }
  }

  if (path.includes("/link-social")) {
    return {
      name: "auth.account.link_social",
    }
  }

  if (path.includes("/update-user")) {
    return {
      name: "auth.user.update",
    }
  }

  if (path.includes("/is-username-available")) {
    return {
      name: "auth.username.available",
    }
  }

  if (path.includes("/request-password-reset")) {
    return {
      name: "auth.password_reset.request",
    }
  }

  if (path.includes("/reset-password")) {
    return {
      name: "auth.password_reset.complete",
    }
  }

  if (path.includes("/verify")) {
    return {
      name: "auth.email.verify",
    }
  }

  if (path.includes("/auth")) {
    if (path.includes("/get-session")) {
      return {
        name: "auth.session.get",
      }
    }

    if (path.includes("/list-accounts")) {
      return {
        name: "auth.accounts.list",
      }
    }

    if (path.includes("/account-info")) {
      return {
        name: "auth.account.info",
      }
    }

    return {
      name: "auth.generic",
    }
  }

  return {
    name: "auth.request",
  }
}

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  const op = resolveAuthOp(path)

  addWide(event, {
    op: {
      name: op.name,
      entity: path.includes("admin")
        ? "admin"
        : "user",
    },
    auth: op.method
      ? {
          method: op.method,
        }
      : undefined,
  })

  return auth.handler(toWebRequest(event))
})

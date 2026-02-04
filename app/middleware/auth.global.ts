import { authClient } from "~/utils/authClient"

export default defineNuxtRouteMiddleware(async (to) => {
  const protectedPaths = [ "/app", "/admin", "/account" ]
  const authPages = [ "/login", "/signup" ]

  const isProtectedRoute = protectedPaths.some((path) => to.path === path || to.path.startsWith(`${path}/`))
  const isAuthPage = authPages.includes(to.path)

  if (!isProtectedRoute && !isAuthPage) {
    return
  }

  const event = useRequestEvent()
  const serverAuth = event?.context.auth ?? null
  const isAdminRoute = to.path === "/admin" || to.path.startsWith("/admin/")

  const resolveSession = async () => {
    if (serverAuth?.userId) {
      return {
        isAuthenticated: true,
        isAdmin: serverAuth.role === "admin",
      }
    }

    const { data: session } = await authClient.useSession(useFetch)
    const userData = session.value ?? null

    return {
      isAuthenticated: Boolean(userData),
      isAdmin: userData?.user?.role === "admin",
    }
  }

  const {
    isAuthenticated, isAdmin,
  } = await resolveSession()

  if (isAuthPage && isAuthenticated) {
    return navigateTo("/app", { redirectCode: 302 })
  }

  if (!isAuthenticated && isProtectedRoute) {
    return navigateTo("/", { redirectCode: 302 })
  }

  if (isAdminRoute && !isAdmin) {
    return navigateTo("/", { redirectCode: 302 })
  }
})

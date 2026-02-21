const ssrSafe = import.meta.client && typeof window !== "undefined" && typeof localStorage !== "undefined"

export const useMainStore = defineStore("main", () => {
  const i18n = ref<Language>("fr")
  const theme = ref<Theme>("dark")
  const isDemo = ref(false)
  const selectedBudgetTrackerId = ref<string | null>(null)
  const currentBudgetTrackerRole = ref<BudgetTrackerRole | null>(null)
  const session = authClient.useSession()
  const serverAuth = useRequestEvent()?.context.auth ?? null

  const getI18n = computed(() => i18n.value)
  const getTheme = computed(() => theme.value)
  const getSession = computed(() => session.value.data ?? null)
  const getServerUser = computed(() => (serverAuth?.userId
    ? {
        id: serverAuth.userId,
        role: serverAuth.role ?? null,
        name: serverAuth.username ?? null,
        email: serverAuth.email ?? null,
        username: serverAuth.username ?? null,
        displayUsername: serverAuth.username ?? null,
      }
    : null))
  const getUser = computed(() => getSession.value?.user ?? getServerUser.value)
  const getUserId = computed(() => getUser.value?.id ?? null)
  const getUserRole = computed(() => getUser.value?.role ?? null)
  const getIsAuthenticated = computed(() => Boolean(getUser.value))
  const getIsAdmin = computed(() => getUserRole.value === "admin")
  const getIsDemo = computed(() => isDemo.value)
  const getSelectedBudgetTrackerId = computed(() => selectedBudgetTrackerId.value)
  const getCurrentBudgetTrackerRole = computed(() => currentBudgetTrackerRole.value)

  const canEditTracker = computed(() => [ "owner", "admin" ].includes(currentBudgetTrackerRole.value ?? ""))
  const canDeleteTracker = computed(() => currentBudgetTrackerRole.value === "owner")
  const canManageUsers = computed(() => [ "owner", "admin" ].includes(currentBudgetTrackerRole.value ?? ""))
  const canEditData = computed(() => [ "owner", "admin", "editor" ].includes(currentBudgetTrackerRole.value ?? ""))

  function initI18n() {
    if (!ssrSafe) {
      return
    }

    // oxlint-disable-next-line no-unsafe-type-assertion
    const storedI18n = localStorage.getItem("i18n") as Language | null

    setI18n(storedI18n ?? "fr")
  }

  function initTheme() {
    if (!ssrSafe) {
      return
    }

    // oxlint-disable-next-line no-unsafe-type-assertion
    const storedTheme = localStorage.getItem("theme") as Theme | null

    if (storedTheme) {
      setTheme(storedTheme)
    }
  }

  function initBudgetTracker() {
    if (!ssrSafe) {
      return
    }

    const storedId = localStorage.getItem("selectedBudgetTrackerId")

    if (storedId) {
      selectedBudgetTrackerId.value = storedId
    }
  }

  function setIsDemo(demo: boolean) {
    isDemo.value = demo
  }

  function setI18n(i18nParam: Language) {
    if (!ssrSafe) {
      return
    }

    i18n.value = i18nParam
    localStorage.setItem("i18n", i18n.value)
  }

  function setTheme(themeParam: Theme) {
    if (!ssrSafe) {
      return
    }

    theme.value = themeParam
    localStorage.setItem("theme", theme.value)
  }

  function setSelectedBudgetTracker(id: string | null, role: BudgetTrackerRole | null = null) {
    selectedBudgetTrackerId.value = id
    currentBudgetTrackerRole.value = role

    if (ssrSafe) {
      if (id !== null) {
        localStorage.setItem("selectedBudgetTrackerId", id)
      } else {
        localStorage.removeItem("selectedBudgetTrackerId")
      }
    }
  }

  async function logout() {
    selectedBudgetTrackerId.value = null
    currentBudgetTrackerRole.value = null

    if (ssrSafe) {
      localStorage.removeItem("selectedBudgetTrackerId")
    }
  }

  function initStore() {
    initI18n()
    initTheme()
    initBudgetTracker()
  }

  return {
    i18n,
    theme,
    selectedBudgetTrackerId,
    currentBudgetTrackerRole,
    getI18n,
    getTheme,
    getSession,
    getUser,
    getUserId,
    getUserRole,
    getIsAuthenticated,
    getIsAdmin,
    getSelectedBudgetTrackerId,
    getCurrentBudgetTrackerRole,
    getIsDemo,
    canEditTracker,
    canDeleteTracker,
    canManageUsers,
    canEditData,
    setIsDemo,
    setI18n,
    setTheme,
    setSelectedBudgetTracker,
    logout,
    initStore,
  }
})

export default useMainStore

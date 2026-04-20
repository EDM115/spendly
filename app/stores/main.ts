const ssrSafe = import.meta.client && typeof window !== "undefined" && typeof localStorage !== "undefined"

function getTodayAnchorDate() {
  const now = new Date()

  return `${now.getFullYear()}-${String(now.getMonth() + 1)
    .padStart(2, "0")}-${String(now.getDate())
    .padStart(2, "0")}`
}

function getDefaultAppPreferences(): AppPreferencesState {
  return {
    timeRange: "month",
    anchorDate: getTodayAnchorDate(),
    balanceOptions: {
      useTotalBalance: false,
      includeFutureEntries: false,
    },
    chartOptions: {
      activeTab: "area",
      simplifiedMode: false,
      showTitle: true,
      showLegend: true,
      showXAxis: true,
      showYAxis: true,
      showGrid: true,
      showPoints: true,
      showBalance: true,
      showIncome: true,
      showExpense: true,
      showExpensePie: true,
      showIncomePie: true,
    },
    pwa: {
      installPromptDismissed: false,
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function normalizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === "boolean"
    ? value
    : fallback
}

function normalizeTimeRange(value: unknown, fallback: AppTimeRange): AppTimeRange {
  return value === "day" || value === "week" || value === "month" || value === "year" || value === "all"
    ? value
    : fallback
}

function normalizeChartTab(value: unknown, fallback: AppChartTab): AppChartTab {
  return value === "area" || value === "pie" || value === "bar" || value === "doughnut"
    ? value
    : fallback
}

function normalizeAnchorDate(value: unknown, fallback: string) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : fallback
}

function parseStoredAppPreferences(rawValue: string | null): AppPreferencesState {
  const defaults = getDefaultAppPreferences()

  if (!rawValue) {
    return defaults
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown

    if (!isRecord(parsed)) {
      return defaults
    }

    const balanceOptions = isRecord(parsed.balanceOptions)
      ? parsed.balanceOptions
      : {}
    const chartOptions = isRecord(parsed.chartOptions)
      ? parsed.chartOptions
      : {}
    const pwa = isRecord(parsed.pwa)
      ? parsed.pwa
      : {}

    return {
      timeRange: normalizeTimeRange(parsed.timeRange, defaults.timeRange),
      anchorDate: normalizeAnchorDate(parsed.anchorDate, defaults.anchorDate),
      balanceOptions: {
        useTotalBalance: normalizeBoolean(balanceOptions.useTotalBalance, defaults.balanceOptions.useTotalBalance),
        includeFutureEntries: normalizeBoolean(balanceOptions.includeFutureEntries, defaults.balanceOptions.includeFutureEntries),
      },
      chartOptions: {
        activeTab: normalizeChartTab(chartOptions.activeTab, defaults.chartOptions.activeTab),
        simplifiedMode: normalizeBoolean(chartOptions.simplifiedMode, defaults.chartOptions.simplifiedMode),
        showTitle: normalizeBoolean(chartOptions.showTitle, defaults.chartOptions.showTitle),
        showLegend: normalizeBoolean(chartOptions.showLegend, defaults.chartOptions.showLegend),
        showXAxis: normalizeBoolean(chartOptions.showXAxis, defaults.chartOptions.showXAxis),
        showYAxis: normalizeBoolean(chartOptions.showYAxis, defaults.chartOptions.showYAxis),
        showGrid: normalizeBoolean(chartOptions.showGrid, defaults.chartOptions.showGrid),
        showPoints: normalizeBoolean(chartOptions.showPoints, defaults.chartOptions.showPoints),
        showBalance: normalizeBoolean(chartOptions.showBalance, defaults.chartOptions.showBalance),
        showIncome: normalizeBoolean(chartOptions.showIncome, defaults.chartOptions.showIncome),
        showExpense: normalizeBoolean(chartOptions.showExpense, defaults.chartOptions.showExpense),
        showExpensePie: normalizeBoolean(chartOptions.showExpensePie, defaults.chartOptions.showExpensePie),
        showIncomePie: normalizeBoolean(chartOptions.showIncomePie, defaults.chartOptions.showIncomePie),
      },
      pwa: {
        installPromptDismissed: normalizeBoolean(pwa.installPromptDismissed, defaults.pwa.installPromptDismissed),
      },
    }
  } catch {
    return defaults
  }
}

export const useMainStore = defineStore("main", () => {
  const i18n = ref<Language>("fr")
  const theme = ref<Theme>("dark")
  const isDemo = ref(false)
  const selectedBudgetTrackerId = ref<string | null>(null)
  const currentBudgetTrackerRole = ref<BudgetTrackerRole | null>(null)
  const appPreferences = ref<AppPreferencesState>(getDefaultAppPreferences())
  const hasInitialized = ref(!ssrSafe)
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
  const getAppPreferences = computed(() => appPreferences.value)
  const getAppTimeRange = computed(() => appPreferences.value.timeRange)
  const getAppAnchorDate = computed(() => appPreferences.value.anchorDate)
  const getBalanceOptions = computed(() => appPreferences.value.balanceOptions)
  const getChartOptions = computed(() => appPreferences.value.chartOptions)
  const getPwaInstallPromptDismissed = computed(() => appPreferences.value.pwa.installPromptDismissed)
  const getHasInitialized = computed(() => hasInitialized.value)

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

  function initAppPreferences() {
    if (!ssrSafe) {
      return
    }

    appPreferences.value = parseStoredAppPreferences(localStorage.getItem("appPreferences"))
  }

  function persistAppPreferences() {
    if (!ssrSafe) {
      return
    }

    localStorage.setItem("appPreferences", JSON.stringify(appPreferences.value))
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

  function setAppDateRange(timeRangeParam: string, anchorDateParam: string) {
    const defaults = getDefaultAppPreferences()

    appPreferences.value = {
      ...appPreferences.value,
      timeRange: normalizeTimeRange(timeRangeParam, defaults.timeRange),
      anchorDate: normalizeAnchorDate(anchorDateParam, defaults.anchorDate),
    }

    persistAppPreferences()
  }

  function setBalanceOptions(options: Partial<BalanceOptionsState>) {
    appPreferences.value = {
      ...appPreferences.value,
      balanceOptions: {
        ...appPreferences.value.balanceOptions,
        ...options,
      },
    }

    persistAppPreferences()
  }

  function setChartOptions(options: Partial<ChartOptionsState>) {
    const current = appPreferences.value.chartOptions

    appPreferences.value = {
      ...appPreferences.value,
      chartOptions: {
        ...current,
        ...options,
        activeTab: normalizeChartTab(options.activeTab, current.activeTab),
      },
    }

    persistAppPreferences()
  }

  function setPwaInstallPromptDismissed(dismissed: boolean) {
    appPreferences.value = {
      ...appPreferences.value,
      pwa: {
        ...appPreferences.value.pwa,
        installPromptDismissed: dismissed,
      },
    }

    persistAppPreferences()
  }

  async function logout() {
    selectedBudgetTrackerId.value = null
    currentBudgetTrackerRole.value = null

    if (ssrSafe) {
      localStorage.removeItem("selectedBudgetTrackerId")
    }
  }

  function initStore() {
    if (hasInitialized.value) {
      return
    }

    initI18n()
    initTheme()
    initBudgetTracker()
    initAppPreferences()
    hasInitialized.value = true
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
    getAppPreferences,
    getAppTimeRange,
    getAppAnchorDate,
    getBalanceOptions,
    getChartOptions,
    getPwaInstallPromptDismissed,
    getHasInitialized,
    canEditTracker,
    canDeleteTracker,
    canManageUsers,
    canEditData,
    setIsDemo,
    setI18n,
    setTheme,
    setSelectedBudgetTracker,
    setAppDateRange,
    setBalanceOptions,
    setChartOptions,
    setPwaInstallPromptDismissed,
    logout,
    initStore,
  }
})

export default useMainStore

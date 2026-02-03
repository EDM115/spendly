import {
  computed,
  computedAsync,
  defineStore,
  ref,
  type BudgetTrackerRole,
  type Language,
  type Theme,
} from "#imports"
import { authClient } from "~/utils/authClient"

const ssrSafe = import.meta.client && typeof window !== "undefined" && typeof localStorage !== "undefined"

export const useMainStore = defineStore("main", () => {
  const i18n = ref<Language>("fr")
  const theme = ref<Theme>("dark")
  const user = ref<unknown>(null)
  const selectedBudgetTrackerId = ref<string | null>(null)
  const currentBudgetTrackerRole = ref<BudgetTrackerRole | null>(null)

  const getI18n = computed(() => i18n.value)
  const getTheme = computed(() => theme.value)
  const getUser = computedAsync(async () => await authClient.getSession())
  const getRawUser = computed(() => user.value)
  const getSelectedBudgetTrackerId = computed(() => selectedBudgetTrackerId.value)
  const getCurrentBudgetTrackerRole = computed(() => currentBudgetTrackerRole.value)
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  const isDemo = computed(() => getUser.value?.data?.user.username === "demo" || (user.value as { username?: string })?.username === "demo")
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

  function setUser(userParam: unknown) {
    user.value = userParam
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
    if (!ssrSafe) {
      return
    }

    user.value = null
    selectedBudgetTrackerId.value = null
    currentBudgetTrackerRole.value = null
    localStorage.removeItem("selectedBudgetTrackerId")
  }

  function initStore() {
    initI18n()
    initTheme()
    initBudgetTracker()
  }

  return {
    i18n,
    theme,
    user,
    selectedBudgetTrackerId,
    currentBudgetTrackerRole,
    getI18n,
    getTheme,
    getUser,
    getRawUser,
    getSelectedBudgetTrackerId,
    getCurrentBudgetTrackerRole,
    isDemo,
    canEditTracker,
    canDeleteTracker,
    canManageUsers,
    canEditData,
    setI18n,
    setTheme,
    setUser,
    setSelectedBudgetTracker,
    logout,
    initStore,
  }
})

export default useMainStore

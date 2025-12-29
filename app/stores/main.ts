import type {
  BudgetTrackerRole,
  Language,
  StoreUser,
  Theme,
} from "~/types"

function ssrSafe() {
  return import.meta.client
    && typeof window !== "undefined"
    && typeof localStorage !== "undefined"
}

export const useMainStore = defineStore("main", () => {
  const i18n = ref<Language>("fr")
  const theme = ref<Theme>("dark")
  const user = ref<StoreUser>(null)
  const selectedBudgetTrackerId = ref<string | null>(null)
  const currentBudgetTrackerRole = ref<BudgetTrackerRole>(null)
  const isValidatingToken = ref(false)

  const getI18n = computed(() => i18n.value)
  const getTheme = computed(() => theme.value)
  const getUser = computed(() => user.value)
  const getSelectedBudgetTrackerId = computed(() => selectedBudgetTrackerId.value)
  const getCurrentBudgetTrackerRole = computed(() => currentBudgetTrackerRole.value)
  const getIsValidatingToken = computed(() => isValidatingToken.value)
  const canEditTracker = computed(() => [ "owner", "admin" ].includes(currentBudgetTrackerRole.value ?? ""))
  const canDeleteTracker = computed(() => currentBudgetTrackerRole.value === "owner")
  const canManageUsers = computed(() => [ "owner", "admin" ].includes(currentBudgetTrackerRole.value ?? ""))
  const canEditData = computed(() => [ "owner", "admin", "editor" ].includes(currentBudgetTrackerRole.value ?? ""))

  function initI18n() {
    if (!ssrSafe()) {
      return
    }

    // oxlint-disable-next-line no-unsafe-type-assertion
    const storedI18n = localStorage.getItem("i18n") as Language | null

    setI18n(storedI18n ?? "fr")
  }

  function initTheme() {
    if (!ssrSafe()) {
      return
    }

    // oxlint-disable-next-line no-unsafe-type-assertion
    const storedTheme = localStorage.getItem("theme") as Theme | null

    if (storedTheme) {
      setTheme(storedTheme)
    }
  }

  function initUser() {
    if (!ssrSafe()) {
      return
    }

    const storedUser = localStorage.getItem("user")

    if (storedUser && storedUser.length > 0) {
      try {
        // Temporarily set the user from localStorage
        // The token will be validated asynchronously
        user.value = JSON.parse(decodeURI(storedUser))
      } catch (e) {
        console.error("Error parsing user data :", e)
        logout()
      }
    }
  }

  async function validateToken(): Promise<boolean> {
    if (!ssrSafe() || !user.value?.token) {
      return false
    }

    isValidatingToken.value = true

    try {
      const response = await $fetch("/api/auth/validate", {
        headers: { Authorization: `Bearer ${user.value.token}` },
      })

      const body = (response as { body: { valid: boolean } }).body

      if (!body.valid) {
        logout()

        return false
      }

      return true
    } catch {
      logout()

      return false
    } finally {
      isValidatingToken.value = false
    }
  }

  function setI18n(i18nParam: Language) {
    if (!ssrSafe()) {
      return
    }

    i18n.value = i18nParam
    localStorage.setItem("i18n", i18n.value)
  }

  function setTheme(themeParam: Theme) {
    if (!ssrSafe()) {
      return
    }

    theme.value = themeParam
    localStorage.setItem("theme", theme.value)
  }

  function setUser(userParam: StoreUser) {
    if (!ssrSafe()) {
      return
    }

    user.value = userParam
    localStorage.setItem("user", encodeURI(JSON.stringify(user.value)))
  }

  function logout() {
    if (!ssrSafe()) {
      return
    }

    user.value = null
    selectedBudgetTrackerId.value = null
    currentBudgetTrackerRole.value = null
    localStorage.removeItem("user")
    localStorage.removeItem("selectedBudgetTrackerId")
  }

  function setSelectedBudgetTracker(id: string | null, role: BudgetTrackerRole = null) {
    selectedBudgetTrackerId.value = id
    currentBudgetTrackerRole.value = role

    if (ssrSafe()) {
      if (id !== null) {
        localStorage.setItem("selectedBudgetTrackerId", id)
      } else {
        localStorage.removeItem("selectedBudgetTrackerId")
      }
    }
  }

  function initBudgetTracker() {
    if (!ssrSafe()) {
      return
    }

    const storedId = localStorage.getItem("selectedBudgetTrackerId")

    if (storedId) {
      selectedBudgetTrackerId.value = storedId
    }
  }

  function initStore() {
    initI18n()
    initTheme()
    initUser()
    initBudgetTracker()
  }

  return {
    i18n,
    theme,
    user,
    selectedBudgetTrackerId,
    currentBudgetTrackerRole,
    isValidatingToken,
    getI18n,
    getTheme,
    getUser,
    getSelectedBudgetTrackerId,
    getCurrentBudgetTrackerRole,
    getIsValidatingToken,
    canEditTracker,
    canDeleteTracker,
    canManageUsers,
    canEditData,
    setI18n,
    setTheme,
    setUser,
    setSelectedBudgetTracker,
    validateToken,
    logout,
    initStore,
  }
})

export default useMainStore

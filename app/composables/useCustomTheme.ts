import {
  useMainStore,
  useVTheme,
  type Theme,
} from "#imports"

export function useCustomTheme() {
  const vtheme = useVTheme()
  const store = useMainStore()

  function changeTheme(theme: Theme) {
    vtheme.change(theme)
    store.setTheme(theme)
  }

  function toggleTheme() {
    changeTheme(store.getTheme === "dark"
      ? "light"
      : "dark")
  }

  return {
    changeTheme,
    toggleTheme,
  }
}

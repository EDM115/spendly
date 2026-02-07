export function useCustomTheme() {
  const vtheme = useVTheme()
  const store = useMainStore()

  watch(
    () => store.getTheme,
    (t) => vtheme.change(t),
    { immediate: true },
  )

  const currentTheme = computed(() => store.getTheme)

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
    currentTheme,
    changeTheme,
    toggleTheme,
  }
}

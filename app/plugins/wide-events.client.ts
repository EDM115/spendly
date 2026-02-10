export default defineNuxtPlugin(() => {
  const pinia = usePinia()
  const { logUiEvent } = useUiEventLogger()
  const actionMap = new Map<string, string>([
    ["main.logout", "auth.logout"],
    ["main.setTheme", "ui.theme.change"],
    ["main.setI18n", "ui.lang.change"],
  ])

  pinia.use(({ store }) => {
    store.$onAction(({ name, after, onError }) => {
      const key = `${store.$id}.${name}`
      const action = actionMap.get(key)
      if (!action) {
        return
      }

      const start = performance.now()

      after(() => {
        void logUiEvent({
          action,
          store: store.$id,
          duration_ms: Math.round(performance.now() - start),
          outcome: "success",
        })
      })

      onError(() => {
        void logUiEvent({
          action,
          store: store.$id,
          duration_ms: Math.round(performance.now() - start),
          outcome: "error",
        })
      })
    })
  })
})

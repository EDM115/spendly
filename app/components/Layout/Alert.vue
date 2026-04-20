<template>
  <v-slide-y-transition>
    <v-alert
      v-if="!close"
      :class="['mx-auto', alertClass, 'my-4']"
      :color="resolvedColor"
      :closable="props.closable ?? true"
      rounded="xl"
      variant="tonal"
      width="100%"
      style="max-width: 600px;"
      border="start"
      :border-color="resolvedColor"
      @click:close="close = true"
    >
      <template #prepend>
        <div class="mr-4">
          <v-btn
            v-if="issue"
            :color="resolvedColor"
            :icon="statusIcon"
            variant="flat"
            size="small"
            :class="buttonClass"
            @click="more = !more"
          />
          <v-icon
            v-else
            :icon="statusIcon"
            size="24"
            class="animate-pulse"
          />
        </div>
      </template>

      <div class="text-body-1 font-weight-bold">
        {{ message }}
      </div>

      <v-expand-transition>
        <div
          v-if="more"
          class="mt-2 text-body-2 text-medium-emphasis code-font pa-2 rounded bg-surface-light"
        >
          {{ issue }}
        </div>
      </v-expand-transition>
    </v-alert>
  </v-slide-y-transition>
</template>

<script lang="ts" setup>
const props = defineProps<{
  color?: string;
  issue?: string;
  message: string;
  closable?: boolean;
}>()

const more = ref(false)
const close = ref(false)

const resolvedColor = computed(() => props.color ?? "error")

const alertClass = computed(() => {
  switch (resolvedColor.value) {
    case "accent":
      return "glass-accent"
    case "info":
      return "glass-info"
    case "primary":
      return "glass-primary"
    case "secondary":
      return "glass-secondary"
    case "success":
      return "glass-success"
    case "warning":
      return "glass-warning"
    default:
      return "glass-error"
  }
})

const buttonClass = computed(() => {
  switch (resolvedColor.value) {
    case "accent":
      return "glow-accent-btn"
    case "info":
      return "glow-info-btn"
    case "primary":
      return "glow-primary-btn"
    case "secondary":
      return "glow-secondary-btn"
    case "success":
      return "glow-success-btn"
    case "warning":
      return "glow-warning-btn"
    default:
      return "glow-error-btn"
  }
})

const statusIcon = computed(() => (resolvedColor.value === "success"
  ? "mdi-check-circle-outline"
  : "mdi-alert-circle-outline"))
</script>

<style lang="scss" scoped>
.glass-accent {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-accent), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-accent), 0.2);
  box-shadow: 0 4px 20px rgba(var(--v-theme-accent), 0.15);
}

.glass-info {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-info), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-info), 0.2);
  box-shadow: 0 4px 20px rgba(var(--v-theme-info), 0.15);
}

.glass-primary {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-primary), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.15);
}

.glass-secondary {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-secondary), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-secondary), 0.2);
  box-shadow: 0 4px 20px rgba(var(--v-theme-secondary), 0.15);
}

.glass-error {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-error), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-error), 0.2);
  box-shadow: 0 4px 20px rgba(var(--v-theme-error), 0.15);
}

.glass-warning {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-warning), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-warning), 0.2);
  box-shadow: 0 4px 20px rgba(var(--v-theme-warning), 0.15);
}

.glass-success {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-success), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-success), 0.2);
  box-shadow: 0 4px 20px rgba(var(--v-theme-success), 0.15);
}

.glow-accent-btn {
  box-shadow: 0 0 10px rgba(var(--v-theme-accent), 0.4);
}

.glow-info-btn {
  box-shadow: 0 0 10px rgba(var(--v-theme-info), 0.4);
}

.glow-primary-btn {
  box-shadow: 0 0 10px rgba(var(--v-theme-primary), 0.4);
}

.glow-secondary-btn {
  box-shadow: 0 0 10px rgba(var(--v-theme-secondary), 0.4);
}

.glow-error-btn {
  box-shadow: 0 0 10px rgba(var(--v-theme-error), 0.4);
}

.glow-warning-btn {
  box-shadow: 0 0 10px rgba(var(--v-theme-warning), 0.4);
}

.glow-success-btn {
  box-shadow: 0 0 10px rgba(var(--v-theme-success), 0.4);
}

.code-font {
  font-family: "Fira Code", monospace;
  word-break: break-word;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>

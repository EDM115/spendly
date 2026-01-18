<template>
  <v-slide-y-transition>
    <v-alert
      v-if="!close"
      class="mx-auto glass-error my-4 rounded-xl"
      :color="color ?? 'error'"
      closable
      variant="tonal"
      width="100%"
      style="max-width: 600px;"
      border="start"
      border-color="error"
      @click:close="close = true"
    >
      <template #prepend>
        <div class="mr-4">
          <v-btn
            v-if="issue"
            :color="color ?? 'error'"
            icon="mdi-alert-circle-outline"
            variant="flat"
            size="small"
            class="glow-error-btn"
            @click="more = !more"
          />
          <v-icon
            v-else
            icon="mdi-alert-circle-outline"
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
defineProps<{
  color?: string;
  issue?: string;
  message: string;
}>()

const more = ref(false)
const close = ref(false)
</script>

<style lang="scss" scoped>
.glass-error {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-error), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-error), 0.2);
  box-shadow: 0 4px 20px rgba(var(--v-theme-error), 0.15);
}

.glow-error-btn {
  box-shadow: 0 0 10px rgba(var(--v-theme-error), 0.4);
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

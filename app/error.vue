<template>
  <NuxtLayout>
    <v-container
      class="fill-height justify-center"
    >
      <v-card
        class="glass-panel rounded-xl pa-8 text-center position-relative overflow-hidden"
        elevation="0"
        max-width="600"
        width="100%"
      >
        <div class="error-glow" />
  
        <h1
          class="text-h1 font-weight-black gradient-text mb-4"
          style="font-size: 8rem !important; line-height: 1;"
        >
          {{ error.statusCode }}
        </h1>
  
        <v-alert
          color="error"
          variant="tonal"
          class="mb-8 rounded-lg text-left glass-error"
          border="start"
        >
          <div class="text-h6 font-weight-bold mb-1">
            {{ t('error.title') }}
          </div>
          {{ error.message }}
        </v-alert>
  
        <v-btn
          :text="t('error.back')"
          to="/"
          color="primary"
          prepend-icon="mdi-home-outline"
          size="x-large"
          rounded="xl"
          variant="flat"
          class="glow-button px-8 font-weight-bold"
        />
      </v-card>
    </v-container>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { NuxtError } from "#app"

const { t } = useI18n()

const props = defineProps<{
  error: NuxtError;
}>()
</script>

<style lang="scss" scoped>
.error-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(var(--v-theme-error), 0.15) 0%, transparent 70%);
  filter: blur(40px);
  z-index: -1;
  pointer-events: none;
}

.glass-error {
  background: rgba(var(--v-theme-error), 0.05) !important;
  border: 1px solid rgba(var(--v-theme-error), 0.1);
}
</style>

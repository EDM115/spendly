<template>
  <v-container
    class="fill-height justify-center"
  >
    <v-card
      class="glass-panel pa-8 text-center position-relative"
      rounded="xl"
      elevation="0"
      max-width="600"
      width="100%"
    >
      <div class="error-glow" />

      <h1
        class="text-h1 font-weight-black gradient-text mb-4"
        style="font-size: 8rem !important; line-height: 1;"
      >
        {{ errorCode }}
      </h1>

      <v-alert
        color="error"
        variant="tonal"
        rounded="lg"
        class="mb-8 text-left glass-error"
        border="start"
      >
        <div class="text-h6 font-weight-bold mb-1">
          {{ t('error.title') }}
        </div>
        {{ error }}
      </v-alert>

      <NuxtLink to="/">
        <v-btn
          :text="t('error.back')"
          color="primary"
          prepend-icon="mdi-home-outline"
          size="x-large"
          rounded="xl"
          variant="flat"
          class="glow-button px-8 font-weight-bold"
        />
      </NuxtLink>
    </v-card>
  </v-container>
</template>

<script lang="ts" setup>
const route = useRoute()
const { t } = useI18n()

const error = route.query.error ?? "An unknown error occured"
// ! TODO : INVALID_TOKEN => magic-link, to i18n
const errorCode = route.query.code ?? 500
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

<template>
  <v-container
    fluid
    class="fill-height pa-0 login-container"
  >
    <div class="ambient-bg" />

    <v-row
      class="fill-height ma-0 mt-10"
      no-gutters
    >
      <v-col
        cols="12"
        md="6"
        lg="7"
        class="d-none d-md-flex align-center justify-center position-relative overflow-hidden"
      >
        <div class="login-brand-bg" />
        <div
          class="glass-panel rounded-xl pa-12 text-center position-relative"
          style="z-index: 10; max-width: 500px; border: 1px solid rgba(255,255,255,0.1);"
        >
          <div class="d-flex justify-center mb-6">
            <div style="position: relative;">
              <NuxtImg
                :src="logoSrc"
                sizes="200px md:300px"
                alt="Spendly"
                :draggable="false"
                preload
                style="filter: drop-shadow(0 0 20px rgba(var(--v-theme-primary), 0.4));"
              />
              <div
                style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 100%;
                  height: 100%;
                  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.6), transparent 70%);
                  filter: blur(40px);
                  z-index: -1;
                "
              />
            </div>
          </div>

          <h1 class="text-h2 font-weight-black mb-4 gradient-text">
            {{ $t('main.title') }}
          </h1>
          <p
            class="text-h5 font-weight-light"
            style="opacity: 0.9"
          >
            {{ $t('landing.hero.subtitle') }}
          </p>
        </div>
      </v-col>

      <v-col
        cols="12"
        md="6"
        lg="5"
        class="d-flex align-center justify-center position-relative"
      >
        <v-container
          class="px-6 px-md-12"
          style="max-width: 550px;"
        >
          <v-card
            class="glass-card pa-8 rounded-xl"
            elevation="0"
          >
            <div class="d-md-none text-center mb-8">
              <NuxtImg
                :src="logoSrc"
                sizes="80px"
                alt="Spendly"
                class="mb-4"
              />
              <h2 class="text-h4 font-weight-bold gradient-text">
                Spendly
              </h2>
            </div>

            <div class="mb-8">
              <h2 class="text-h4 font-weight-bold mb-2">
                {{ $t('login.title') }}
              </h2>
              <p class="text-medium-emphasis">
                {{ $t('login.welcome') }}
              </p>
            </div>

            <Login />
          </v-card>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
const store = useMainStore()

const logoSrc = computed(() => (store.getTheme === "light"
  ? "/images/logo_alt.webp"
  : "/images/logo.webp"))

onMounted(async () => {
  if (store.getUser !== null && !store.isDemo) {
    await navigateTo("/app", { redirectCode: 302 })
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  margin-top: -64px;
  min-height: 100vh;
}

.login-brand-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(var(--v-theme-primary), 0.4), transparent 60%),
    radial-gradient(circle at 80% 80%, rgba(var(--v-theme-secondary), 0.4), transparent 60%);
  filter: blur(80px);
  opacity: 0.6;
  animation: bg-shift 10s infinite alternate;
}

@keyframes bg-shift {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}
</style>

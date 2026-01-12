<template>
  <div class="landing-page">
    <div
      class="hero-color"
      style="height: 64px; display: block; width: 100vw;"
    />
    <section class="hero-section hero-color position-relative d-flex align-center">
      <v-container>
        <v-row
          align="center"
          justify="center"
          class="text-center text-md-left"
        >
          <v-col
            cols="12"
            md="6"
            lg="5"
            class="position-relative z-10 d-flex justify-center justify-md-end"
          >
            <div class="mb-4 mb-md-0">
              <NuxtImg
                src="/images/logo.webp"
                sizes="300px md:400px"
                alt="Spendly Logo"
                class="logo-img"
                :draggable="false"
                preload
              />
              <div class="logo-glow" />
            </div>
          </v-col>

          <v-col
            cols="12"
            md="7"
            lg="6"
            class="position-relative z-10"
          >
            <h1 class="text-h2 font-weight-black pb-6 text-gradient">
              {{ $t('landing.hero.title') }}
            </h1>

            <p class="text-h6 text-md-h5 text-medium-emphasis mb-10 font-weight-light">
              {{ $t('landing.hero.subtitle') }}
            </p>
          </v-col>

          <v-col
            cols="12"
            class="position-relative z-10"
          >
            <div class="d-flex justify-center ga-4 flex-wrap">
              <v-btn
                color="primary"
                size="x-large"
                to="/login"
                prepend-icon="mdi-login-variant"
                elevation="4"
                rounded="xl"
                class="px-8 font-weight-bold"
              >
                {{ $t('navbar.connect') }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="x-large"
                color="text"
                href="https://github.com/EDM115/spendly#readme"
                target="_blank"
                prepend-icon="mdi-github"
                rounded="xl"
                class="px-8"
              >
                {{ $t('landing.github') }}
              </v-btn>
            </div>
          </v-col>

          <v-col
            cols="1"
            class="position-relative z-10 mt-4"
          >
            <v-icon
              icon="mdi-chevron-down"
              size="large"
              class="animate-bounce"
            />
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="features-section py-16 bg-surface-light">
      <v-container>
        <v-row justify="center">
          <v-col
            cols="12"
            md="8"
            class="text-center mb-16"
          >
            <v-chip
              color="secondary"
              variant="tonal"
              class="mb-4 font-weight-bold"
            >
              {{ $t('landing.features.chip') }}
            </v-chip>
            <h2 class="text-h3 font-weight-bold mb-4">
              {{ $t('landing.features.title') }}
            </h2>
            <div class="divider-gradient mx-auto" />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="(feature, i) in features"
            :key="i"
            cols="12"
            md="4"
          >
            <v-hover v-slot="{ isHovering, props }">
              <v-card
                v-bind="props"
                class="feature-card h-100 py-8 px-6"
                :elevation="isHovering ? 8 : 2"
                :color="isHovering ? `${feature.color}-darken-2` : 'surface'"
                rounded="xl"
              >
                <div
                  class="icon-box mb-6"
                  :class="`bg-${feature.color}-lighten-5`"
                >
                  <v-icon
                    :icon="feature.icon"
                    size="48"
                    :color="feature.color"
                  />
                </div>
                <h3 class="text-h5 font-weight-bold mb-3">
                  {{ feature.title }}
                </h3>
                <p class="text-body-1">
                  {{ feature.desc }}
                </p>
              </v-card>
            </v-hover>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="py-16 position-relative">
      <v-container class="position-relative z-10">
        <v-card
          color="background"
          theme="dark"
          class="overflow-hidden"
          rounded="xl"
          elevation="0"
          border
        >
          <v-row class="ma-0">
            <v-col
              cols="12"
              md="6"
              class="pa-12 d-flex flex-column justify-center"
            >
              <h2 class="text-h3 font-weight-bold mb-6">
                {{ $t('landing.join.title') }}
              </h2>
              <p class="text-h6 font-weight-light mb-8 opacity-90">
                {{ $t('landing.join.text') }}
              </p>
              <div>
                <v-btn
                  color="white"
                  variant="outlined"
                  size="large"
                  href="mailto:spendly@edm115.dev"
                  prepend-icon="mdi-email-outline"
                  rounded="lg"
                >
                  spendly@edm115.dev
                </v-btn>
              </div>
            </v-col>
            <v-col
              cols="12"
              md="6"
              class="pa-0 position-relative d-none d-md-block"
            >
              <div class="join-pattern h-100 w-100" />
            </v-col>
          </v-row>
        </v-card>
      </v-container>
    </section>

    <v-footer class="bg-background py-8 text-center d-flex flex-column border-t">
      <div class="d-flex ga-4 mb-4 align-center">
        <v-btn
          icon="mdi-github"
          variant="text"
          href="https://github.com/EDM115/spendly#readme"
          target="_blank"
          color="medium-emphasis"
        />
      </div>
      <div class="text-body-2 text-medium-emphasis">
        {{ new Date().getFullYear() }} — <strong>Spendly</strong>
      </div>
    </v-footer>
  </div>
</template>

<script lang="ts" setup>
const store = useMainStore()
const theme = useVTheme()
const { t } = useI18n()

const darkPrimaryColor = ref(theme.computedThemes.value.dark?.colors.primary ?? "#4ADE80")

const features = computed(() => [
  {
    icon: "mdi-progress-check",
    color: "secondary",
    title: t("landing.features.tracking.title"),
    desc: t("landing.features.tracking.desc"),
  },
  {
    icon: "mdi-chart-box-multiple-outline",
    color: "accent",
    title: t("landing.features.charts.title"),
    desc: t("landing.features.charts.desc"),
  },
  {
    icon: "mdi-currency-usd-off",
    color: "success",
    title: t("landing.features.free.title"),
    desc: t("landing.features.free.desc"),
  },
])

onMounted(async () => {
  if (store.getUser !== null) {
    await navigateTo("/app", { redirectCode: 302 })
  }
})
</script>

<style lang="scss" scoped>
.landing-page {
  overflow-x: hidden;
  margin-top: -64px;
}

.hero-color {
  background: radial-gradient(circle at top right, rgba(var(--v-theme-primary), 0.15), transparent 40%),
              radial-gradient(circle at bottom left, rgba(var(--v-theme-secondary), 0.15), transparent 40%);
}

.hero-section {
  min-height: calc(100vh - 64px);
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, v-bind(darkPrimaryColor) 0%, transparent 60%);
  transform: translate(-50%, -50%);
  filter: blur(60px) saturate(110%);
  z-index: -1;
}

.features-section {
  min-height: calc(100vh - 64px);
}

.logo-img {
  filter: drop-shadow(0 0 20px rgba(var(--v-theme-primary), 0.3));
  transition: transform 0.3s ease;
}

.text-gradient {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.z-10 {
  z-index: 10;
}

.scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.7;
  z-index: 10;
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.divider-gradient {
  height: 8px;
  width: min(350px, 90vw);
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 4px;
}

.feature-card {
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.icon-box {
  width: 80px;
  height: 80px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.join-pattern {
  background-image: radial-gradient(rgba(var(--v-theme-primary), 0.2) 1px, transparent 1px);
  background-size: 20px 20px;
  opacity: 0.5;
}
</style>

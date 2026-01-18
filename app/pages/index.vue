<template>
  <div class="landing-page">
    <div style="height: 64px; display: block; width: 100vw;" />
    <section class="hero-section position-relative d-flex align-center overflow-hidden">
      <div class="hero-blob blob-1" />
      <div class="hero-blob blob-2" />

      <v-container class="mt-8">
        <v-row
          align="center"
          justify="center"
          class="text-center text-md-left"
        >
          <v-col
            cols="12"
            md="6"
            lg="5"
            class="position-relative z-10 d-flex justify-center justify-md-end order-md-2 logo-wrapper"
          >
            <div class="animate-float">
              <NuxtImg
                :src="logoSrc"
                sizes="300px md:450px"
                alt="Spendly Logo"
                :draggable="false"
                preload
              />
              <div class="logo-glow-intense" />
            </div>
          </v-col>

          <v-col
            cols="12"
            md="6"
            lg="7"
            class="position-relative z-10 order-md-1"
          >
            <h1
              class="text-h2 text-md-h1 font-weight-black pb-6 mt-n12 mt-md-4 lh-tight"
            >
              {{ $t('landing.hero.tagline.0') }}<span class="gradient-text">{{ $t('landing.hero.tagline.1') }}</span><br>
              {{ $t('landing.hero.tagline.2') }}<span class="text-stroke">{{ $t('landing.hero.tagline.3') }}</span>{{ $t('landing.hero.tagline.4') }}
            </h1>

            <p
              class="text-h6 text-medium-emphasis mb-10 font-weight-light"
              style="max-width: 600px"
            >
              {{ $t('landing.hero.subtitle') }}
            </p>

            <div class="d-flex justify-center justify-md-start ga-4 flex-wrap">
              <v-btn
                color="primary"
                size="x-large"
                to="/login"
                prepend-icon="mdi-rocket-launch"
                elevation="8"
                rounded="xl"
                class="px-8 font-weight-bold glow-button"
              >
                {{ $t('navbar.connect') }}
              </v-btn>
              <v-btn
                variant="outlined"
                size="x-large"
                color="secondary"
                href="https://github.com/EDM115/spendly#readme"
                target="_blank"
                prepend-icon="mdi-github"
                rounded="xl"
                class="px-8 glass-button"
              >
                {{ $t('landing.github') }}
              </v-btn>
              <div class="scroll-mouse-indicator ml-md-2">
                <div class="mouse-wheel" />
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="py-16 position-relative">
      <v-container>
        <v-row justify="center">
          <v-col
            cols="12"
            md="8"
            class="text-center mb-16"
          >
            <h2 class="text-h3 font-weight-bold mb-4">
              <span class="gradient-text">{{ $t('landing.features.title') }}</span>
            </h2>
            <div class="divider-glow mx-auto" />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="(feature, i) in features"
            :key="i"
            cols="12"
            md="4"
          >
            <v-card
              class="glass-card h-100 py-8 px-6 rounded-xl"
              elevation="0"
            >
              <div
                class="icon-box mb-6"
                :style="`background: rgba(var(--v-theme-${feature.color}), 0.1); color: rgb(var(--v-theme-${feature.color}))`"
              >
                <v-icon
                  :icon="feature.icon"
                  size="40"
                />
              </div>
              <h3 class="text-h5 font-weight-bold mb-3">
                {{ feature.title }}
              </h3>
              <p class="text-body-1 text-medium-emphasis">
                {{ feature.desc }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="py-16 position-relative overflow-hidden">
      <div
        style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80%;
          height: 80%;
          background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.1) 0%, transparent 70%);
          filter: blur(80px);
          z-index: 0;
        "
      />

      <v-container class="position-relative z-10">
        <div class="glass-panel rounded-xl overflow-hidden pa-1">
          <v-card
            color="transparent"
            class="overflow-hidden"
            rounded="xl"
            elevation="0"
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
                    color="primary"
                    variant="flat"
                    size="large"
                    href="mailto:spendly@edm115.dev"
                    prepend-icon="mdi-email-outline"
                    rounded="lg"
                    class="glow-button px-8"
                  >
                    spendly@edm115.dev
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </v-container>
    </section>

    <v-footer class="bg-transparent py-8 text-center d-flex flex-column">
      <div class="d-flex ga-4 mb-2 align-center">
        <v-btn
          icon="mdi-github"
          variant="text"
          href="https://github.com/EDM115/spendly#readme"
          target="_blank"
          color="secondary"
        />
      </div>
      <div class="text-body-2 text-medium-emphasis">
        {{ new Date().getFullYear() }} - <strong class="gradient-text">Spendly</strong>
      </div>
    </v-footer>
  </div>
</template>

<script lang="ts" setup>
const store = useMainStore()
const { t } = useI18n()

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

const logoSrc = computed(() => (store.getTheme === "light"
  ? "/images/logo_alt.webp"
  : "/images/logo.webp"))

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

.hero-section {
  min-height: 100vh;
  margin-top: -64px;
}

.hero-blob {
  position: absolute;
  width: 50vw;
  height: 50vw;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 0;
  opacity: 0.5;
  animation: blob-float 10s infinite alternate;
}

.blob-1 {
  top: -10vw;
  left: -10vw;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.4), transparent 70%);
}

.blob-2 {
  bottom: 0;
  right: -10vw;
  background: radial-gradient(circle, rgba(var(--v-theme-secondary), 0.4), transparent 70%);
  animation-delay: -5s;
}

@keyframes blob-float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(20px, 20px) scale(1.1); }
}

.logo-wrapper {
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
}

.logo-glow-intense {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, rgba(var(--v-theme-primary), 0.5) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  filter: blur(40px);
  z-index: -1;
  animation: pulse-glow 3s infinite alternate;
}

@keyframes pulse-glow {
  0% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.95); }
  100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
}

.glass-button {
  backdrop-filter: blur(10px);
  background: rgba(var(--v-theme-surface), 0.1);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);

  &:hover {
    background: rgba(var(--v-theme-surface), 0.2);
  }
}

.text-stroke {
  -webkit-text-stroke: 1px rgba(var(--v-theme-on-background), 0.5);
  color: transparent;
}

.scroll-mouse-indicator {
  width: 30px;
  height: 50px;
  border: 2px solid rgba(var(--v-theme-on-background), 0.3);
  border-radius: 15px;
  position: relative;

  .mouse-wheel {
    width: 4px;
    height: 8px;
    background: rgb(var(--v-theme-primary));
    border-radius: 2px;
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    animation: scroll-wheel 2s infinite;
  }
}

@keyframes scroll-wheel {
  0% { transform: translate(-50%, 0); opacity: 1; }
  100% { transform: translate(-50%, 20px); opacity: 0; }
}

.divider-glow {
  height: 2px;
  width: 150px;
  background: linear-gradient(90deg, rgba(var(--v-theme-primary), 0.1), rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.1));
  box-shadow: 0 0 10px rgb(var(--v-theme-primary));
}

.icon-box {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.glass-card:hover .icon-box {
  transform: scale(1.1) rotate(-5deg);
}
</style>

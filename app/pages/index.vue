<template>
  <div class="landing-page">
    <div style="height: 64px; display: block; width: 100vw;" />
    <section class="hero-section position-relative d-flex align-center overflow-visible">
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
                :alt="t('main.title')"
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
              {{ t('landing.hero.tagline.0') }}<span class="gradient-text">{{ t('landing.hero.tagline.1') }}</span><br>
              {{ t('landing.hero.tagline.2') }}<span class="text-stroke">{{ t('landing.hero.tagline.3') }}</span>{{ t('landing.hero.tagline.4') }}
            </h1>

            <p
              class="text-h6 text-medium-emphasis mb-10 font-weight-light"
              style="max-width: 600px"
            >
              {{ t('landing.hero.subtitle') }}
            </p>

            <div class="d-flex justify-center justify-md-start ga-4 flex-wrap mobile-btn-group">
              <NuxtLink to="/login">
                <v-btn
                  color="primary"
                  variant="flat"
                  size="x-large"
                  prepend-icon="mdi-rocket-launch"
                  rounded="xl"
                  class="px-8 font-weight-bold glow-button"
                >
                  {{ t('landing.get-started') }}
                </v-btn>
              </NuxtLink>
              <NuxtLink to="/demo">
                <v-btn
                  variant="tonal"
                  size="x-large"
                  color="secondary"
                  prepend-icon="mdi-eye-outline"
                  rounded="xl"
                  class="px-8 glass-button"
                >
                  {{ t('landing.demo') }}
                </v-btn>
              </NuxtLink>
              <div class="scroll-mouse-indicator flex-column ml-md-4">
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
            <h2 class="text-h3 font-weight-bold mb-4 gradient-text">
              {{ t('landing.features.title') }}
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
              class="glass-card h-100 py-8 px-6"
              rounded="xl"
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

    <section class="py-10 py-md-16 position-relative">
      <v-container>
        <v-row justify="center">
          <v-col
            cols="12"
            md="8"
            class="text-center mb-8"
          >
            <h2 class="text-h3 font-weight-bold mb-8">
              <span class="gradient-text">{{ t('landing.details.title') }}</span>
            </h2>
            <div class="divider-glow mx-auto" />
          </v-col>
        </v-row>

        <v-row class="mb-8 mb-md-12">
          <v-col
            cols="12"
            md="7"
          >
            <h2 class="text-h3 text-md-h2 font-weight-bold mb-4">
              {{ t('landing.details.goal.title') }}
            </h2>
            <p class="text-h6 text-medium-emphasis font-weight-light mb-4">
              {{ t('landing.details.goal.description') }}
            </p>
            <p class="text-body-1 text-medium-emphasis mb-6">
              {{ t('landing.details.goal.secondary') }}
            </p>

            <div class="d-flex ga-3 flex-wrap">
              <v-chip
                v-for="(chip, i) in valueChips"
                :key="i"
                color="primary"
                variant="tonal"
                rounded="lg"
                class="font-weight-medium"
              >
                <v-icon
                  :icon="chip.icon"
                  start
                  size="18"
                />
                {{ chip.label }}
              </v-chip>
            </div>
          </v-col>

          <v-col
            cols="12"
            md="5"
          >
            <v-card
              class="glass-card h-100 px-4 py-4"
              rounded="xl"
            >
              <p class="text-overline text-medium-emphasis mb-3">
                {{ t('landing.details.quickFacts.title') }}
              </p>

              <div class="stats-grid">
                <div
                  v-for="(stat, i) in quickFacts"
                  :key="i"
                  class="stat-item"
                >
                  <p class="text-h5 font-weight-bold mb-1">
                    {{ stat.value }}
                  </p>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    {{ stat.label }}
                  </p>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="(item, i) in detailedHighlights"
            :key="i"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              class="glass-card h-100 px-5 py-6"
              rounded="xl"
            >
              <div
                class="icon-box mb-4"
                :style="`background: rgba(var(--v-theme-${item.color}), 0.1); color: rgb(var(--v-theme-${item.color}))`"
              >
                <v-icon
                  :icon="item.icon"
                  size="32"
                />
              </div>

              <h3 class="text-h6 font-weight-bold mb-2">
                {{ item.title }}
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ item.desc }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="py-4 py-md-8 position-relative">
      <v-container>
        <v-row class="mb-8">
          <v-col
            cols="12"
            md="9"
            class="mx-auto text-center"
          >
            <h2 class="text-h3 font-weight-bold mb-4">
              {{ t('landing.details.workflow.title') }}
            </h2>
            <p class="text-h6 text-medium-emphasis font-weight-light">
              {{ t('landing.details.workflow.subtitle') }}
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="(step, i) in workflowSteps"
            :key="i"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              class="glass-card h-100 px-5 py-6"
              rounded="xl"
            >
              <div class="d-flex justify-space-between align-start mb-4">
                <v-avatar
                  color="primary"
                  class="icon-box"
                  :icon="step.icon"
                  variant="tonal"
                  size="42"
                />
                <span class="text-overline text-medium-emphasis">{{ step.step }}</span>
              </div>

              <h3 class="text-h6 font-weight-bold mb-2">
                {{ step.title }}
              </h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ step.desc }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="py-4 py-md-8 position-relative">
      <v-container>
        <v-row class="mb-8">
          <v-col
            cols="12"
            class="mx-auto text-center"
          >
            <h2 class="text-h3 font-weight-bold mb-3">
              {{ t('landing.details.capabilities.title') }}
            </h2>
            <p class="text-h6 text-medium-emphasis font-weight-light">
              {{ t('landing.details.capabilities.subtitle') }}
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="(capability, i) in capabilities"
            :key="i"
            cols="12"
            md="6"
          >
            <v-card
              class="glass-card h-100 px-6 py-6"
              rounded="xl"
            >
              <div class="d-flex align-center ga-3 mb-4">
                <v-icon
                  :icon="capability.icon"
                  color="primary"
                  size="26"
                />
                <h3 class="text-h6 font-weight-bold mb-0">
                  {{ capability.title }}
                </h3>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ capability.desc }}
              </p>

              <ul class="capability-list">
                <li
                  v-for="(item, itemIndex) in capability.items"
                  :key="itemIndex"
                  class="text-body-2"
                >
                  {{ item }}
                </li>
              </ul>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="py-4 py-md-8 position-relative">
      <v-container>
        <v-row class="mb-4">
          <v-col
            cols="12"
            class="mx-auto text-center"
          >
            <h2 class="text-h3 font-weight-bold mb-3">
              {{ t('landing.details.security.category-title') }}
            </h2>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-card
              class="glass-card h-100 px-6 py-6"
              rounded="xl"
            >
              <div class="d-flex align-center ga-3 mb-3">
                <v-icon
                  icon="mdi-shield-check-outline"
                  color="success"
                  size="28"
                />
                <h2 class="text-h5 font-weight-bold mb-0">
                  {{ t('landing.details.security.title') }}
                </h2>
              </div>

              <p class="text-body-1 text-medium-emphasis mb-4">
                {{ t('landing.details.security.subtitle') }}
              </p>

              <ul class="capability-list mb-0">
                <li
                  v-for="(point, i) in securityPoints"
                  :key="i"
                  class="text-body-2"
                >
                  {{ point }}
                </li>
              </ul>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            md="6"
          >
            <v-card
              class="glass-card h-100 px-6 py-6"
              rounded="xl"
            >
              <div class="d-flex align-center ga-3 mb-3">
                <v-icon
                  icon="mdi-api"
                  color="secondary"
                  size="28"
                />
                <h2 class="text-h5 font-weight-bold mb-0">
                  {{ t('landing.details.api.title') }}
                </h2>
              </div>

              <p class="text-body-1 text-medium-emphasis mb-4">
                {{ t('landing.details.api.subtitle') }}
              </p>

              <ul class="capability-list mb-0">
                <li
                  v-for="(endpoint, i) in apiEndpoints"
                  :key="i"
                  class="text-body-2"
                >
                  {{ endpoint }}
                </li>
              </ul>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="py-4 py-md-8 position-relative">
      <v-container>
        <v-row class="mb-8">
          <v-col
            cols="12"
            class="text-center"
          >
            <h2 class="text-h3 font-weight-bold mb-3">
              {{ t('landing.details.stack.title') }}
            </h2>
            <p class="text-h6 text-medium-emphasis font-weight-light mx-auto stack-subtitle">
              {{ t('landing.details.stack.subtitle') }}
            </p>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            v-for="(pillar, i) in stackPillars"
            :key="i"
            cols="12"
            md="4"
          >
            <v-card
              class="glass-card h-100 px-5 py-6"
              rounded="xl"
            >
              <div class="d-flex align-center ga-3 mb-3">
                <v-icon
                  :icon="pillar.icon"
                  color="accent"
                  size="26"
                />
                <h3 class="text-h6 font-weight-bold mb-0">
                  {{ pillar.title }}
                </h3>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ pillar.desc }}
              </p>

              <div class="d-flex ga-2 flex-wrap">
                <v-chip
                  v-for="(chip, chipIndex) in pillar.chips"
                  :key="chipIndex"
                  size="small"
                  variant="tonal"
                  color="accent"
                  rounded="lg"
                >
                  {{ chip }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-6 mt-md-10">
          <v-col cols="12">
            <v-card
              class="glass-card px-6 py-6"
              rounded="xl"
            >
              <div class="d-flex align-center ga-3 mb-3">
                <v-icon
                  icon="mdi-code-block-tags"
                  color="accent"
                  size="26"
                />
                <h3 class="text-h6 font-weight-bold mb-0">
                  {{ t('landing.details.stack.implementation.title') }}
                </h3>
              </div>

              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ t('landing.details.stack.implementation.description') }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <section class="py-12 pb-16 position-relative">
      <v-container>
        <v-card
          class="glass-card cta-card px-6 px-md-10 py-8 py-md-10 text-center"
          rounded="xl"
        >
          <h2 class="text-h4 text-md-h3 font-weight-bold mb-3">
            {{ t('landing.details.cta.title') }}
          </h2>
          <p class="text-h6 text-medium-emphasis font-weight-light mb-8 mx-auto cta-subtitle">
            {{ t('landing.details.cta.subtitle') }}
          </p>

          <div class="d-flex justify-center ga-4 flex-wrap">
            <NuxtLink to="/signup">
              <v-btn
                color="primary"
                variant="flat"
                size="x-large"
                prepend-icon="mdi-account-plus-outline"
                rounded="xl"
                class="px-8 font-weight-bold"
              >
                {{ t('landing.details.cta.createAccount') }}
              </v-btn>
            </NuxtLink>

            <NuxtLink to="/demo">
              <v-btn
                color="secondary"
                variant="tonal"
                size="x-large"
                prepend-icon="mdi-eye-outline"
                rounded="xl"
                class="px-8"
              >
                {{ t('landing.details.cta.viewDemo') }}
              </v-btn>
            </NuxtLink>
          </div>
        </v-card>
      </v-container>
    </section>
  </div>
</template>

<script lang="ts" setup>
const store = useMainStore()
const { t } = useI18n()
const hasRedirected = ref(false)

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

const valueChips = computed(() => [
  {
    icon: "mdi-license",
    label: t("landing.details.goal.chips.openSource"),
  },
  {
    icon: "mdi-cash-off",
    label: t("landing.details.goal.chips.free"),
  },
  {
    icon: "mdi-translate",
    label: t("landing.details.goal.chips.i18n"),
  },
  {
    icon: "mdi-account-group-outline",
    label: t("landing.details.goal.chips.collaboration"),
  },
])

const quickFacts = computed(() => [
  {
    value: t("landing.details.quickFacts.fact1.value"),
    label: t("landing.details.quickFacts.fact1.label"),
  },
  {
    value: t("landing.details.quickFacts.fact2.value"),
    label: t("landing.details.quickFacts.fact2.label"),
  },
  {
    value: t("landing.details.quickFacts.fact3.value"),
    label: t("landing.details.quickFacts.fact3.label"),
  },
  {
    value: t("landing.details.quickFacts.fact4.value"),
    label: t("landing.details.quickFacts.fact4.label"),
  },
])

const detailedHighlights = computed(() => [
  {
    icon: "mdi-view-dashboard-outline",
    color: "primary",
    title: t("landing.details.highlights.trackers.title"),
    desc: t("landing.details.highlights.trackers.desc"),
  },
  {
    icon: "mdi-shape-outline",
    color: "accent",
    title: t("landing.details.highlights.categories.title"),
    desc: t("landing.details.highlights.categories.desc"),
  },
  {
    icon: "mdi-table-large",
    color: "info",
    title: t("landing.details.highlights.transactions.title"),
    desc: t("landing.details.highlights.transactions.desc"),
  },
  {
    icon: "mdi-chart-areaspline",
    color: "secondary",
    title: t("landing.details.highlights.analytics.title"),
    desc: t("landing.details.highlights.analytics.desc"),
  },
])

const workflowSteps = computed(() => [
  {
    step: t("landing.details.workflow.step1.number"),
    icon: "mdi-account-check-outline",
    title: t("landing.details.workflow.step1.title"),
    desc: t("landing.details.workflow.step1.desc"),
  },
  {
    step: t("landing.details.workflow.step2.number"),
    icon: "mdi-folder-open-outline",
    title: t("landing.details.workflow.step2.title"),
    desc: t("landing.details.workflow.step2.desc"),
  },
  {
    step: t("landing.details.workflow.step3.number"),
    icon: "mdi-pencil-box-multiple-outline",
    title: t("landing.details.workflow.step3.title"),
    desc: t("landing.details.workflow.step3.desc"),
  },
  {
    step: t("landing.details.workflow.step4.number"),
    icon: "mdi-chart-timeline-variant-shimmer",
    title: t("landing.details.workflow.step4.title"),
    desc: t("landing.details.workflow.step4.desc"),
  },
])

const capabilities = computed(() => [
  {
    icon: "mdi-cash-multiple",
    title: t("landing.details.capabilities.budgeting.title"),
    desc: t("landing.details.capabilities.budgeting.desc"),
    items: [
      t("landing.details.capabilities.budgeting.items.0"),
      t("landing.details.capabilities.budgeting.items.1"),
      t("landing.details.capabilities.budgeting.items.2"),
    ],
  },
  {
    icon: "mdi-account-multiple-outline",
    title: t("landing.details.capabilities.collaboration.title"),
    desc: t("landing.details.capabilities.collaboration.desc"),
    items: [
      t("landing.details.capabilities.collaboration.items.0"),
      t("landing.details.capabilities.collaboration.items.1"),
      t("landing.details.capabilities.collaboration.items.2"),
    ],
  },
  {
    icon: "mdi-speedometer",
    title: t("landing.details.capabilities.experience.title"),
    desc: t("landing.details.capabilities.experience.desc"),
    items: [
      t("landing.details.capabilities.experience.items.0"),
      t("landing.details.capabilities.experience.items.1"),
      t("landing.details.capabilities.experience.items.2"),
    ],
  },
  {
    icon: "mdi-export-variant",
    title: t("landing.details.capabilities.export.title"),
    desc: t("landing.details.capabilities.export.desc"),
    items: [
      t("landing.details.capabilities.export.items.0"),
      t("landing.details.capabilities.export.items.1"),
      t("landing.details.capabilities.export.items.2"),
    ],
  },
])

const securityPoints = computed(() => [
  t("landing.details.security.points.0"),
  t("landing.details.security.points.1"),
  t("landing.details.security.points.2"),
  t("landing.details.security.points.3"),
  t("landing.details.security.points.4"),
])

const apiEndpoints = computed(() => [
  t("landing.details.api.endpoints.0"),
  t("landing.details.api.endpoints.1"),
  t("landing.details.api.endpoints.2"),
  t("landing.details.api.endpoints.3"),
  t("landing.details.api.endpoints.4"),
  t("landing.details.api.endpoints.5"),
])

const stackPillars = computed(() => [
  {
    icon: "mdi-monitor-dashboard",
    title: t("landing.details.stack.frontend.title"),
    desc: t("landing.details.stack.frontend.desc"),
    chips: [
      t("landing.details.stack.frontend.chips.0"),
      t("landing.details.stack.frontend.chips.1"),
      t("landing.details.stack.frontend.chips.2"),
      t("landing.details.stack.frontend.chips.3"),
    ],
  },
  {
    icon: "mdi-server-network-outline",
    title: t("landing.details.stack.backend.title"),
    desc: t("landing.details.stack.backend.desc"),
    chips: [
      t("landing.details.stack.backend.chips.0"),
      t("landing.details.stack.backend.chips.1"),
      t("landing.details.stack.backend.chips.2"),
      t("landing.details.stack.backend.chips.3"),
    ],
  },
  {
    icon: "mdi-database-outline",
    title: t("landing.details.stack.data.title"),
    desc: t("landing.details.stack.data.desc"),
    chips: [
      t("landing.details.stack.data.chips.0"),
      t("landing.details.stack.data.chips.1"),
      t("landing.details.stack.data.chips.2"),
      t("landing.details.stack.data.chips.3"),
    ],
  },
])

const logoSrc = computed(() => (store.getTheme === "light"
  ? "/images/logo_alt.webp"
  : "/images/logo.webp"))

useGradientTextForMainTitle({
  observe: false,
})

onMounted(async () => {
  if (store.getIsAuthenticated && !hasRedirected.value) {
    hasRedirected.value = true
    await navigateTo("/app", { redirectCode: 302 })
  }
})

watch(() => store.getIsAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated && !hasRedirected.value) {
    hasRedirected.value = true
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-item {
  background: rgba(var(--v-theme-surface), 0.12);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  padding: 12px;
}

.capability-list {
  padding-left: 1.1rem;
  margin: 0;

  li {
    color: rgba(var(--v-theme-on-surface), 0.88);
    margin-bottom: 0.45rem;
    line-height: 1.45;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.stack-subtitle,
.cta-subtitle {
  max-width: 780px;
}

.cta-card {
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.08), rgba(var(--v-theme-secondary), 0.04));
    pointer-events: none;
  }

  > * {
    position: relative;
    z-index: 1;
  }
}

@media (max-width: 600px) {
  .mobile-btn-group {
    flex-direction: column;
    align-content: center;
    align-items: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

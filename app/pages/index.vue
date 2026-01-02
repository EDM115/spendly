<template>
  <div class="overflow-x-hidden">
    <v-container class="fill-height hero-section mt-14">
      <v-row
        align="center"
        justify="center"
        class="text-center"
      >
        <v-col
          cols="12"
          md="6"
        >
          <NuxtImg
            src="/images/logo.webp"
            sizes="300px md:400px"
            alt="Spendly Logo"
            class="mb-6"
            :draggable="false"
            preload
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <h1 class="text-h2 font-weight-bold mb-4 text-primary">
            {{ $t('landing.hero.title') }}
          </h1>
          <p class="text-h5 text-medium-emphasis mb-8">
            {{ $t('landing.hero.subtitle') }}
          </p>
          <div class="d-flex justify-center ga-4 flex-wrap">
            <v-btn
              color="secondary"
              size="large"
              to="/login"
              prepend-icon="mdi-login"
            >
              {{ $t('navbar.connect') }}
            </v-btn>
            <v-btn
              variant="outlined"
              size="large"
              color="accent"
              href="https://github.com/EDM115/spendly#readme"
              target="_blank"
              prepend-icon="mdi-github"
            >
              {{ $t('landing.github') }}
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <v-container class="py-16">
      <v-row justify="center">
        <v-col
          cols="12"
          class="text-center mb-12"
        >
          <h2 class="text-h3 font-weight-bold">
            {{ $t('landing.features.title') }}
          </h2>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-card
            class="h-100 text-center py-8 px-4"
            elevation="2"
            color="surface"
          >
            <v-icon
              icon="mdi-progress-check"
              size="64"
              color="secondary"
              class="mb-4"
            />
            <h3 class="text-h5 font-weight-bold mb-2">
              {{ $t('landing.features.tracking.title') }}
            </h3>
            <p class="text-body-1">
              {{ $t('landing.features.tracking.desc') }}
            </p>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-card
            class="h-100 text-center py-8 px-4"
            elevation="2"
            color="surface"
          >
            <v-icon
              icon="mdi-chart-box-multiple-outline"
              size="64"
              color="accent"
              class="mb-4"
            />
            <h3 class="text-h5 font-weight-bold mb-2">
              {{ $t('landing.features.charts.title') }}
            </h3>
            <p class="text-body-1">
              {{ $t('landing.features.charts.desc') }}
            </p>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-card
            class="h-100 text-center py-8 px-4"
            elevation="2"
            color="surface"
          >
            <v-icon
              icon="mdi-currency-usd-off"
              size="64"
              color="success"
              class="mb-4"
            />
            <h3 class="text-h5 font-weight-bold mb-2">
              {{ $t('landing.features.free.title') }}
            </h3>
            <p class="text-body-1">
              {{ $t('landing.features.free.desc') }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-container
      fluid
      class="bg-surface py-16"
    >
      <v-row
        justify="center"
        class="text-center"
      >
        <v-col
          cols="12"
          md="8"
        >
          <h2 class="text-h3 font-weight-bold mb-6">
            {{ $t('landing.join.title') }}
          </h2>
          <p class="text-h5 mb-8">
            {{ $t('landing.join.text') }}
            <a
              href="mailto:spendly@edm115.dev"
              class="text-primary font-weight-bold text-decoration-none"
            >
              spendly@edm115.dev
            </a>
          </p>
        </v-col>
      </v-row>
    </v-container>

    <v-footer class="bg-background py-8 text-center d-flex flex-column">
      <div class="d-flex ga-4 mb-2 align-center">
        <v-btn
          icon="mdi-github"
          variant="text"
          href="https://github.com/EDM115/spendly#readme"
          target="_blank"
        />
        <div class="text-body-2 text-medium-emphasis">
          {{ new Date().getFullYear() }} - <strong>Spendly</strong>
        </div>
      </div>
    </v-footer>
  </div>
</template>

<style scoped>
.hero-section {
  min-height: 80vh;
}
</style>

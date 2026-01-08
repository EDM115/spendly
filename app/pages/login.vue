<template>
  <v-container
    fluid
    class="fill-height pa-0 login-container"
  >
    <v-row
      class="fill-height ma-0"
      no-gutters
    >
      <v-col
        cols="12"
        md="6"
        lg="7"
        class="d-none d-md-flex align-center justify-center position-relative bg-surface-variant"
      >
        <div class="brand-bg" />
        <div
          class="text-center position-relative pa-12"
          style="z-index: 10"
        >
          <NuxtImg
            src="/images/logo.webp"
            sizes="200px md:300px"
            alt="Spendly"
            :draggable="false"
            preload
          />
          <h1 class="text-h2 font-weight-bold mb-4">
            {{ $t('main.title') }}
          </h1>
          <p
            class="text-h5"
            style="opacity: 0.8"
          >
            {{ $t('landing.hero.subtitle') }}
          </p>
        </div>
      </v-col>

      <v-col
        cols="12"
        md="6"
        lg="5"
        class="d-flex align-center justify-center bg-background mb-4"
      >
        <v-container
          class="px-6 px-md-12"
          style="max-width: 500px;"
        >
          <div class="d-md-none text-center mb-8">
            <NuxtImg
              src="/images/logo.webp"
              sizes="200px md:300px"
              alt="Spendly"
              class="mb-4"
              style="margin-top: 64px"
            />
            <h2 class="text-h4 font-weight-bold">
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
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
const store = useMainStore()

onMounted(async () => {
  if (store.getUser !== null) {
    await navigateTo("/app", { redirectCode: 302 })
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  margin-top: -64px;
  min-height: 100vh;
}

.brand-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;

  background-image:
    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.18'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
    linear-gradient(
      135deg,
      rgba(var(--v-theme-primary), 0.92),
      rgba(var(--v-theme-secondary), 0.92)
    );

  background-repeat: repeat, no-repeat;
  background-size: 60px 60px, cover;
  background-position: 0 0, center;
}
</style>

<template>
  <v-app :theme="theme">
    <div class="ambient-bg" />

    <NuxtRouteAnnouncer />

    <NuxtPwaAssets />

    <LayoutNavBar />

    <ClientOnly>
      <v-snackbar
        :model-value="showUpdateSnackbar"
        :timeout="-1"
        :color="theme === 'dark' ? 'background-lighten-1' : 'background-darken-1'"
        location="top right"
        class="update-snackbar mx-4 mx-md-8 mt-6"
        rounded="lg"
        transition="scroll-y-transition"
      >
        <v-icon
          icon="mdi-update"
          color="primary"
          class="mr-2"
        />
        <span class="font-weight-bold">
          {{ t('main.update-available') }}
        </span>
        <template #actions>
          <v-btn
            color="primary"
            class="pr-2"
            variant="elevated"
            @click="refreshToUpdate"
          >
            {{ t("main.update") }}
          </v-btn>
        </template>
      </v-snackbar>

      <v-snackbar
        v-model="showInstallSnackbar"
        :timeout="-1"
        :color="theme === 'dark' ? 'background-lighten-1' : 'background-darken-1'"
        location="top right"
        class="update-snackbar mx-4 mx-md-8 mt-6"
        rounded="lg"
        transition="scroll-y-transition"
      >
        <v-icon
          :icon="mdAndUp ? 'mdi-monitor-arrow-down-variant' : 'mdi-cellphone-arrow-down-variant'"
          color="primary"
          class="mr-2"
        />
        <span class="font-weight-bold">
          {{ t('main.install') }}
        </span>
        <template #actions>
          <div class="d-flex flex-column my-2">
            <v-btn
              color="success"
              class="pr-2"
              variant="tonal"
              @click="installFromSnackbar"
            >
              {{ t("main.install-confirm") }}
            </v-btn>
            <v-btn
              color="error"
              class="pr-2 mt-2"
              variant="outlined"
              @click="dismissInstallSnackbar"
            >
              {{ t("main.install-dismiss") }}
            </v-btn>
          </div>
        </template>
      </v-snackbar>
    </ClientOnly>

    <v-main>
      <slot />
    </v-main>

    <v-footer
      v-if="!['/app', '/admin', '/demo'].includes(route.path)"
      class="bg-transparent py-8 text-center d-flex flex-column"
    >
      <div class="d-flex align-center">
        <v-btn
          icon="mdi-github"
          variant="text"
          href="https://github.com/EDM115/spendly#readme"
          target="_blank"
          color="secondary"
        />
      </div>
      <div class="text-body-medium text-medium-emphasis mb-2">
        {{ new Date().getFullYear() }} - <strong class="gradient-text">{{ t('main.title') }}</strong>
      </div>
      <div class="text-body-medium text-medium-emphasis mb-2">
        <NuxtLink
          to="/privacy-policy"
          style="color: rgb(var(--v-theme-secondary))"
        >
          {{ t('privacy-policy.title') }}
        </NuxtLink> - <NuxtLink
          to="/terms-of-use"
          style="color: rgb(var(--v-theme-secondary))"
        >
          {{ t('terms-of-use.title') }}
        </NuxtLink>
      </div>
    </v-footer>
  </v-app>
</template>

<script lang="ts" setup>
import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill"

const PWA_INSTALL_DISMISS_KEY = "vite-pwa:hide-install"
const PWA_FORCE_INSTALL_SNACKBAR_SESSION_KEY = "spendly:pwa-force-install-snackbar"

const i18nHead = useLocaleHead()
const route = useRoute()
const { $pwa } = useNuxtApp()
const {
  t,
  setLocale,
} = useI18n()
const store = useMainStore()
const { changeTheme } = useCustomTheme()
const { mdAndUp } = useVDisplay()

const theme = computed(() => store.getTheme)
const showUpdateSnackbar = computed(() => $pwa?.needRefresh ?? false)
const showInstallSnackbar = ref(false)
let installSnackbarTimeout: ReturnType<typeof setTimeout> | undefined
let installSnackbarSyncInterval: ReturnType<typeof setInterval> | undefined

async function clearBrowserCaches() {
  if (!import.meta.client || !("caches" in window)) {
    return
  }

  const cacheKeys = await window.caches.keys()

  await Promise.all(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)))
}

async function unregisterServiceWorkers() {
  if (!import.meta.client || !("serviceWorker" in navigator)) {
    return
  }

  const registrations = await navigator.serviceWorker.getRegistrations()

  await Promise.all(registrations.map((registration) => registration.unregister()))
}

function reloadCurrentPageWithCacheBust() {
  if (!import.meta.client) {
    return
  }

  const url = new URL(window.location.href)

  url.searchParams.set("pwa-update", Date.now()
    .toString())
  window.location.replace(url.toString())
}

async function refreshToUpdate() {
  if (!$pwa) {
    return
  }

  await $pwa.updateServiceWorker(false)
  await clearBrowserCaches()
  await unregisterServiceWorkers()
  reloadCurrentPageWithCacheBust()
}

function scheduleInstallSnackbar(delay = 2000) {
  if (installSnackbarTimeout) {
    clearTimeout(installSnackbarTimeout)
  }

  installSnackbarTimeout = setTimeout(() => {
    showInstallSnackbar.value = true
    installSnackbarTimeout = undefined
  }, delay)
}

function stopInstallSnackbarSync() {
  if (installSnackbarSyncInterval) {
    clearInterval(installSnackbarSyncInterval)
    installSnackbarSyncInterval = undefined
  }
}

function canShowInstallSnackbarNow() {
  return (!$pwa?.isPWAInstalled && $pwa?.showInstallPrompt && !showUpdateSnackbar.value) ?? false
}

function syncInstallSnackbar(delay = 2000) {
  if (canShowInstallSnackbarNow()) {
    if (!showInstallSnackbar.value && !installSnackbarTimeout) {
      scheduleInstallSnackbar(delay)
    }

    return true
  }

  return false
}

function startInstallSnackbarSync(initialDelay = 2000) {
  let attempts = 0

  if (syncInstallSnackbar(initialDelay)) {
    return
  }

  stopInstallSnackbarSync()
  installSnackbarSyncInterval = setInterval(() => {
    attempts += 1

    if (syncInstallSnackbar(0) || attempts >= 24) {
      stopInstallSnackbarSync()
    }
  }, 250)
}

async function installFromSnackbar() {
  if (import.meta.client) {
    localStorage.removeItem(PWA_INSTALL_DISMISS_KEY)
  }

  await $pwa?.install()
}

function dismissInstallSnackbar() {
  if (import.meta.client) {
    localStorage.setItem(PWA_INSTALL_DISMISS_KEY, "true")
    sessionStorage.removeItem(PWA_FORCE_INSTALL_SNACKBAR_SESSION_KEY)
  }

  // $pwa?.cancelInstall()
  showInstallSnackbar.value = false
}

useHead({
  title: t("main.title"),
  meta: [
    {
      name: "darkreader-lock",
      content: "true",
    },
    {
      name: "description", content: t("main.description"),
    },
    {
      name: "og:image:type", content: "image/png",
    },
    {
      name: "og:image:width", content: "1920",
    },
    {
      name: "og:image:height", content: "1080",
    },
    {
      name: "twitter:card", content: "summary_large_image",
    },
    {
      name: "twitter:image:src", content: "/images/og.png",
    },
    {
      name: "twitter:image:width", content: "1920",
    },
    {
      name: "twitter:image:height", content: "1080",
    },
  ],
  link: [
    {
      rel: "icon", type: "image/png", href: "/images/logo.png",
    },
  ],
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs.lang ?? "fr",
    translate: "no",
  },
})

useSeoMeta({
  title: t("main.title"),
  ogTitle: t("main.title"),
  description: t("main.description"),
  ogDescription: t("main.description"),
  ogImage: "/images/og.png",
  ogType: "website",
  ogUrl: "https://spendly.edm115.dev",
  ogLocale: "fr_FR",
})

onMounted(() => {
  if (localStorage.getItem("theme") === "light") {
    changeTheme("light")
  } else {
    changeTheme("dark")
  }

  store.initStore()
  setLocale(store.getI18n)
  polyfillCountryFlagEmojis(
    "Twemoji Country Flags",
    "/fonts/TwemojiCountryFlags.woff2",
  )

  const forceInstallSnackbar = sessionStorage.getItem(PWA_FORCE_INSTALL_SNACKBAR_SESSION_KEY) === "true"

  sessionStorage.removeItem(PWA_FORCE_INSTALL_SNACKBAR_SESSION_KEY)

  startInstallSnackbarSync(forceInstallSnackbar
    ? 0
    : 2000)
})

onBeforeUnmount(() => {
  if (installSnackbarTimeout) {
    clearTimeout(installSnackbarTimeout)
  }

  stopInstallSnackbarSync()
})
</script>

<style lang="scss">
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease-in-out;
}

.page-enter-from,
.page-leave-to {
  filter: blur(0.5rem);
  opacity: 0;
  transform: translateY(-20px);
}

.update-snackbar .v-snackbar__wrapper,
.update-snackbar .v-snackbar__content {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: stretch;
  column-gap: 12px;
}

.update-snackbar .v-icon {
  grid-column: 1;
  align-self: stretch;
  height: 100%;
  display: flex;
  align-items: center;
}

.update-snackbar .v-snackbar__content {
  padding-right: 0px !important;
}

.update-snackbar .v-snackbar__content > span {
  grid-column: 2;
  align-self: center;
  min-width: 0;
}

.update-snackbar .v-snackbar__actions {
  grid-column: 3;
  align-self: center;
  margin-inline-end: 16px !important;
}

@media (max-width: 600px) {
  .update-snackbar .v-snackbar__actions {
    max-width: min-content;
    margin-inline-end: 16px !important;
  }
}
</style>

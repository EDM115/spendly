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
          color="success"
          class="mr-2"
        />
        <span class="font-weight-bold">
          {{ t('main.update-available') }}
        </span>
        <template #actions>
          <v-btn
            color="success"
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
          color="success"
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
              @click="$pwa?.install()"
            >
              {{ t("main.install-confirm") }}
            </v-btn>
            <v-btn
              color="error"
              class="pr-2 mt-2"
              variant="outlined"
              @click="$pwa?.cancelInstall()"
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
      <div class="text-body-2 text-medium-emphasis mb-2">
        {{ new Date().getFullYear() }} - <strong class="gradient-text">{{ t('main.title') }}</strong>
      </div>
      <div class="text-body-2 text-medium-emphasis mb-2">
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
const shouldShowInstallSnackbar = computed(() => (!$pwa?.isPWAInstalled && $pwa?.showInstallPrompt && !showUpdateSnackbar.value) ?? false)
let installSnackbarTimeout: ReturnType<typeof setTimeout> | undefined

async function refreshToUpdate() {
  if (!$pwa) {
    return
  }

  await $pwa.updateServiceWorker()
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
      rel: "icon", type: "image/webp", href: "/images/logo.webp",
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
})

watch(shouldShowInstallSnackbar, (newValue) => {
  if (installSnackbarTimeout) {
    clearTimeout(installSnackbarTimeout)
    installSnackbarTimeout = undefined
  }

  if (newValue) {
    installSnackbarTimeout = setTimeout(() => {
      showInstallSnackbar.value = true
      installSnackbarTimeout = undefined
    }, 2000)
    return
  }

  showInstallSnackbar.value = false
}, { immediate: true })
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

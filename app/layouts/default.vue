<template>
  <v-app :theme="theme">
    <div class="ambient-bg" />
    <NuxtRouteAnnouncer />
    <LayoutNavBar />
    <v-main>
      <slot />
    </v-main>
    <v-footer
      v-if="!['/app', '/admin', '/account', '/demo'].includes(route.path)"
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
const {
  t,
  setLocale,
} = useI18n()
const store = useMainStore()
const { changeTheme } = useCustomTheme()

const theme = computed(() => store.getTheme)

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
</script>

<style>
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
</style>

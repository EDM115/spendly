<template>
  <v-app-bar
    :class="['force-ssr', smAndUp ? 'nav-desktop' : 'nav-mobile', 'glass-panel']"
    color="transparent"
    :elevation="0"
    floating
    rounded="b-xl"
    :density="smAndUp ? 'default' : 'comfortable'"
  >
    <template #prepend>
      <NuxtLink
        :to="connected && !store.getIsDemo ? '/app' : '/'"
        class="flex items-center"
      >
        <NuxtImg
          :src="logoSrc"
          :alt="t('main.title')"
          :draggable="false"
          height="40px"
          width="40px"
          sizes="40px"
          :placeholder="[10, 10, 50, 5]"
          preload
          class="nav-logo"
        />
      </NuxtLink>
    </template>
    <v-app-bar-title>
      <NuxtLink
        v-if="smAndUp"
        :to="connected && !store.getIsDemo ? '/app' : '/'"
        class="text-h6 font-weight-bold"
      >
        {{ t('main.title') }}
      </NuxtLink>
    </v-app-bar-title>
    <v-spacer />
    <v-menu v-model="menuOpen">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          class="mr-4"
          :icon="menuOpen ? 'mdi-close' : 'mdi-menu'"
        />
      </template>
      <div class="d-flex flex-column gap-2 mt-2 pa-2 glass-panel rounded-lg">
        <v-btn
          v-if="connected && !store.getIsDemo && store.getIsAdmin"
          to="/admin"
          class="mb-2"
          variant="text"
          rounded="lg"
          prepend-icon="mdi-shield-account-outline"
          :text="t('navbar.admin')"
        />
        <v-btn
          v-if="connected && !store.getIsDemo"
          to="/account"
          class="mb-4"
          variant="text"
          rounded="lg"
          prepend-icon="mdi-account-circle-outline"
          :text="t('navbar.account')"
        />
        <v-btn-toggle
          v-model="selectedTheme"
          color="secondary"
          class="mb-2"
          rounded="lg"
          mandatory
          border
          variant="outlined"
        >
          <v-btn
            icon="mdi-weather-sunny"
            class="w-50"
            value="light"
          />
          <v-btn
            icon="mdi-weather-night"
            class="w-50"
            value="dark"
          />
        </v-btn-toggle>
        <v-btn-toggle
          v-model="selectedLanguage"
          color="secondary"
          class="mb-4"
          rounded="lg"
          mandatory
          border
          variant="outlined"
        >
          <v-btn
            v-for="l in locales"
            :key="l.name"
            :class="`w-${100 / locales.length}`"
            style="font-size: 1.5rem;"
            :value="l.code"
          >
            {{ getFlagEmoji(l.code) }}
          </v-btn>
        </v-btn-toggle>
        <v-btn
          :prepend-icon="accountIcon"
          :text="accountText"
          :color="accountColor"
          class="mb-1"
          variant="tonal"
          rounded="lg"
          @click="handleConnect"
        />
      </div>
    </v-menu>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { authClient } from "~/utils/authClient"

const store = useMainStore()
const route = useRoute()
const { changeTheme } = useCustomTheme()
const { smAndUp } = useVDisplay()
const {
  t,
  locales,
  setLocale,
} = useI18n()

const menuOpen = ref(false)
const selectedTheme = computed<Theme>({
  get: () => store.getTheme,
  set: (val) => changeTheme(val),
})
const selectedLanguage = computed<Language>({
  get: () => store.getI18n,
  set: (val) => {
    setLocale(val)
    store.setI18n(val)
  },
})
const connected = computed(() => store.getIsAuthenticated)
const accountIcon = computed(() => (connected.value
  ? "mdi-logout"
  : "mdi-login"))
const accountText = computed(() => (connected.value
  ? t("navbar.disconnect")
  : t("navbar.connect")))
const accountColor = computed(() => (connected.value
  ? "error"
  : "success"))

const logoSrc = computed(() => (selectedTheme.value === "light"
  ? "/images/logo_alt.webp"
  : "/images/logo.webp"))

const getFlagEmoji = (l: string): string => {
  switch (l) {
    case "en":
      return "🇺🇸"
    case "fr":
      return "🇫🇷"
    default:
      return "🌐"
  }
}

async function handleConnect() {
  if (connected.value) {
    store.logout()
    await authClient.signOut()
    await navigateTo("/")
  } else {
    await navigateTo("/login")
  }
}
</script>

<style lang="scss" scoped>
.force-ssr {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transform: translateY(0px);
  z-index: 1006;
}

.nav-desktop {
  padding: 8px 16px 0;
  margin: 0 16px 16px;
  width: calc(100% - 32px) !important;
}

.nav-mobile {
  padding: 6px 12px 0;
  margin: 0 8px 12px;
  width: calc(100% - 16px) !important;
}

.nav-logo {
  transition: transform 0.3s ease;
  &:hover {
    transform: rotate(-5deg) scale(1.1);
  }
}

.v-btn-group--horizontal {
  overflow-x: clip;
}
</style>

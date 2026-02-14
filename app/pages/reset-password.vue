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
        class="d-none d-md-flex align-center justify-center position-relative"
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
                :alt="t('main.title')"
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
            {{ t('main.title') }}
          </h1>
          <p
            class="text-h5 font-weight-light"
            style="opacity: 0.9"
          >
            {{ t('landing.hero.subtitle') }}
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
            class="glass-card pa-8 mt-8"
            rounded="xl"
            elevation="0"
          >
            <div class="d-md-none text-center mb-8">
              <NuxtImg
                :src="logoSrc"
                sizes="80px"
                :alt="t('main.title')"
                class="mb-4"
              />
              <h2 class="text-h4 font-weight-bold gradient-text">
                {{ t('main.title') }}
              </h2>
            </div>

            <div class="mb-8">
              <h2 class="text-h4 font-weight-bold mb-2">
                {{ t('reset-password.title') }}
              </h2>
              <p class="text-medium-emphasis">
                {{ hasToken && !invalidToken ? t('reset-password.welcome-reset') : t('reset-password.welcome') }}
              </p>
            </div>

            <div v-if="hasToken && !invalidToken">
              <AuthResetPassword :token="token" />
            </div>

            <div v-else>
              <v-expand-transition>
                <LayoutAlert
                  v-if="errorMessage"
                  :message="errorMessage"
                  :issue="issueMessage"
                  :color="messageColor"
                />
              </v-expand-transition>

              <div
                v-if="requestSent"
                class="d-flex flex-column align-center"
              >
                <NuxtLink to="/login">
                  <v-btn
                    block
                    color="primary"
                    size="large"
                    rounded="xl"
                    variant="tonal"
                    prepend-icon="mdi-login"
                    class="text-none font-weight-bold mt-4"
                  >
                    {{ t('reset-password.back-to-login') }}
                  </v-btn>
                </NuxtLink>
              </div>

              <v-form
                v-else
                ref="form"
                @submit.prevent="submit"
              >
                <div class="mb-4">
                  <v-text-field
                    v-model="state.email"
                    variant="outlined"
                    color="primary"
                    rounded="lg"
                    :label="t('reset-password.email')"
                    :rules="emailRules"
                    prepend-inner-icon="mdi-email-outline"
                    hide-details="auto"
                  />
                </div>

                <VueTurnstile
                  ref="turnstileRef"
                  :site-key="turnstileKey"
                  :language="storeLang ?? 'auto'"
                  :theme="storeTheme ?? 'auto'"
                  appearance="execute"
                  size="flexible"
                  :tabindex="-1"
                  @success="onTurnstileSuccess"
                  @error="onTurnstileError"
                  @expired="onTurnstileExpired"
                  @timeout="onTurnstileTimeout"
                />

                <v-btn
                  block
                  color="primary"
                  size="large"
                  rounded="xl"
                  type="submit"
                  variant="flat"
                  :loading="loading"
                  :disabled="btnDisabled || !form?.isValid"
                  prepend-icon="mdi-email-fast-outline"
                  class="text-none font-weight-bold glow-button"
                >
                  {{ t('reset-password.send-link') }}
                </v-btn>
              </v-form>
              <NuxtLink to="/login">
                <v-btn
                  block
                  color="primary"
                  size="large"
                  rounded="xl"
                  type="submit"
                  variant="tonal"
                  prepend-icon="mdi-login"
                  class="text-none font-weight-bold mt-4"
                >
                  {{ t('login.login') }}
                </v-btn>
              </NuxtLink>
            </div>
          </v-card>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import type {
  ComponentInternalInstance,
  Raw,
} from "vue"

import { VueTurnstile } from "vue-cloudflare-turnstile"
import { authClient } from "~/utils/authClient"

const store = useMainStore()
const route = useRoute()
const config = useRuntimeConfig()
const requestUrl = useRequestURL()
const {
  locale,
  t,
} = useI18n()

useHead({ title: t("main.reset-password") })

const logoSrc = computed(() => (store.getTheme === "light"
  ? "/images/logo_alt.webp"
  : "/images/logo.webp"))

const storeLang = computed(() => store.getI18n)
const storeTheme = computed(() => store.getTheme)

const token = computed(() => (typeof route.query.token === "string"
  ? route.query.token
  : ""))

const hasToken = computed(() => token.value.length > 0)

const invalidToken = computed(() => {
  const errorValue = route.query.error
  const normalized = Array.isArray(errorValue)
    ? errorValue[0]
    : errorValue

  return normalized === "INVALID_TOKEN" || normalized === "invalid_token"
})

const errorMessage = ref("")
const issueMessage = ref("")
const messageColor = ref("error")
const loading = ref(false)
const btnDisabled = ref(true)
const lastErrorTurnstile = ref(false)
const turnstileRef = ref<InstanceType<typeof VueTurnstile> | null>(null)
const turnstileToken = ref("")
const requestSent = ref(false)

const form = ref<{
  id: number | string;
  validate: () => Promise<string[]>;
  reset: () => Promise<void>;
  resetValidation: () => Promise<void>;
  vm: Raw<ComponentInternalInstance>;
  isValid: boolean | null;
  errorMessages: string[];
}>()

const emailRules = ref([
  (v: unknown) => !!v || t("rules.email.required"),
  (v: string) => (v && (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(v)) || t("rules.email.valid"),
])

const turnstileKey = config.public.turnstileSiteKey

const initialState = {
  email: "",
}

const state = reactive({ ...initialState })

function handleError(error: {
  code?: string | undefined;
  message?: string | undefined;
  statusText: string;
  color?: string;
}) {
  messageColor.value = error.color ?? "error"
  errorMessage.value = error.message ?? error.code ?? t("error.unknown")
  issueMessage.value = error.statusText
}

function onTurnstileSuccess(tokenValue: string) {
  if (lastErrorTurnstile.value) {
    lastErrorTurnstile.value = false
    errorMessage.value = ""
    issueMessage.value = ""
  }

  btnDisabled.value = false
  turnstileToken.value = tokenValue
}

function onTurnstileError(errorCode: string | undefined) {
  lastErrorTurnstile.value = true
  handleError({
    code: errorCode,
    message: t("turnstile.error"),
    statusText: t("turnstile.refresh"),
  })
  btnDisabled.value = true
}

function onTurnstileExpired() {
  lastErrorTurnstile.value = true
  handleError({
    message: t("turnstile.expired"),
    statusText: t("turnstile.wait"),
    color: "warning",
  })
  btnDisabled.value = true
}

function onTurnstileTimeout() {
  lastErrorTurnstile.value = true
  handleError({
    message: t("turnstile.timeout"),
    statusText: t("turnstile.wait"),
    color: "warning",
  })
  btnDisabled.value = true
}

async function clear() {
  Object.assign(state, initialState)
  await form.value?.reset()
  turnstileRef.value?.reset()
  btnDisabled.value = true
  turnstileToken.value = ""
}

async function submit() {
  errorMessage.value = ""
  issueMessage.value = ""
  loading.value = true

  const redirectTo = `${requestUrl.origin}/reset-password`
  const { error } = await authClient.requestPasswordReset({
    email: state.email,
    redirectTo,
    fetchOptions: {
      headers: {
        "x-captcha-response": turnstileToken.value,
      },
    },
  })

  if (error) {
    lastErrorTurnstile.value = false
    handleError(error)
  } else {
    messageColor.value = "success"
    errorMessage.value = t("reset-password.request-success")
    issueMessage.value = ""
    requestSent.value = true
    await clear()
  }

  loading.value = false
}

watchEffect(() => {
  const _l = locale.value

  if (invalidToken.value && !requestSent.value) {
    messageColor.value = "error"
    errorMessage.value = t("reset-password.invalid-token")
    issueMessage.value = t("reset-password.request-new-link")
  }
})

onMounted(async () => {
  store.setIsDemo(false)
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

.vue-turnstile {
  justify-self: center;
  margin-bottom: 16px;
}
</style>

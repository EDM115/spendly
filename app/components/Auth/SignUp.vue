<template>
  <div class="w-100 login-root">
    <v-expand-transition>
      <LayoutAlert
        v-if="errorMessage"
        :message="errorMessage"
        :issue="issueMessage"
        :color="messageColor"
      />
    </v-expand-transition>

    <v-alert
      v-if="!disabledFeaturesList['oauth-github'] && !disabledFeaturesList['oauth-google']"
      color="info"
      elevation="4"
      icon="mdi-lightbulb-outline"
      icon-size="default"
      variant="outlined"
      rounded="lg"
      :text="t('signup.oauth')"
    />

    <v-form
      ref="form"
      class="pt-8"
      @submit.prevent="submit"
    >
      <div class="mb-4">
        <v-text-field
          v-model="state.username"
          variant="outlined"
          color="primary"
          rounded="lg"
          :label="t('signup.username')"
          :rules="usernameRules"
          prepend-inner-icon="mdi-account-circle-outline"
          hide-details="auto"
        />
      </div>

      <div class="mb-4">
        <v-text-field
          v-model="state.email"
          variant="outlined"
          color="primary"
          rounded="lg"
          :label="t('signup.email')"
          :rules="emailRules"
          prepend-inner-icon="mdi-email-outline"
          hide-details="auto"
        />
      </div>

      <div class="mb-4">
        <v-text-field
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          color="primary"
          rounded="lg"
          :label="t('signup.password')"
          :rules="passwordRules"
          prepend-inner-icon="mdi-key-outline"
          hide-details="auto"
        >
          <template #append-inner>
            <v-btn
              icon
              variant="text"
              density="compact"
              :tabindex="-1"
              @click="togglePasswordVisibility"
            >
              <v-icon size="small">
                {{ showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}
              </v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </div>

      <div class="mb-6">
        <v-text-field
          v-model="state.passwordConfirm"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          color="primary"
          rounded="lg"
          :label="t('signup.passwordConfirm')"
          :rules="passwordConfirmRules"
          prepend-inner-icon="mdi-key-outline"
          hide-details="auto"
        >
          <template #append-inner>
            <v-btn
              icon
              variant="text"
              density="compact"
              :tabindex="-1"
              @click="togglePasswordVisibility"
            >
              <v-icon size="small">
                {{ showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}
              </v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </div>

      <VueTurnstile
        v-if="!disabledFeaturesList['turnstile']"
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
        :disabled="btnDisabled || !form?.isValid || loading"
        prepend-icon="mdi-login-variant"
        class="text-none font-weight-bold glow-button"
      >
        {{ t('signup.signup') }}
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
</template>

<script lang="ts" setup>
import type {
  ComponentInternalInstance,
  Raw,
} from "vue"

import { VueTurnstile } from "vue-cloudflare-turnstile"

const config = useRuntimeConfig()
const store = useMainStore()
const { t } = useI18n()
const { logUiEvent } = useUiEventLogger()

const storeLang = computed(() => store.getI18n)
const storeTheme = computed(() => store.getTheme)
const disabledFeaturesList = computed(() => disabledFeatures())
const errorMessage = ref("")
const issueMessage = ref("")
const messageColor = ref("error")
const showPassword = ref(false)
const loading = ref(false)
const btnDisabled = ref(true)
const turnstileRef = ref<InstanceType<typeof VueTurnstile> | null>(null)
const lastErrorTurnstile = ref(false)
const turnstileToken = ref("")
const form = ref<{
  id: number | string;
  validate: () => Promise<string[]>;
  reset: () => Promise<void>;
  resetValidation: () => Promise<void>;
  vm: Raw<ComponentInternalInstance>;
  isValid: boolean | null;
  errorMessages: string[];
}>()

async function usernameAvailable(name: string) {
  const {
    data, error,
  } = await authClient.isUsernameAvailable({
    username: name.trim(),
  })

  return error
    ? false
    : data?.available ?? false
}

const emailRules = ref([
  (v: unknown) => !!v || t("rules.email.required"),
  (v: string) => (v && (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(v)) || t("rules.email.valid"),
])

const usernameRules = ref([
  (v: unknown) => !!v || t("rules.username.required"),
  (v: string) => (v && v.trim().length >= 3) || t("rules.username.min", { min: 3 }),
  (v: string) => (v && v.trim().length <= 128) || t("rules.username.max", { max: 128 }),
  (v: string) => (v && (/^[a-zA-Z0-9_]+$/).test(v.trim())) || t("rules.username.alphanumeric"),
  async (v: string) => (v && await usernameAvailable(v)) || t("rules.username.already-taken"),
])

const passwordRules = ref([
  (v: unknown) => !!v || t("rules.password.required"),
  (v: string) => (v && v.length >= 8) || t("rules.password.min", { min: 8 }),
  (v: string) => (v && v.length <= 16384) || t("rules.password.max", { max: 16384 }),
  (v: string) => (v && (/[a-z]/).test(v)) || t("rules.password.lowercase"),
  (v: string) => (v && (/[A-Z]/).test(v)) || t("rules.password.uppercase"),
  (v: string) => (v && (/\d/).test(v)) || t("rules.password.number"),
  (v: string) => (v && (/[^a-zA-Z0-9]/).test(v)) || t("rules.password.special"),
])

const passwordConfirmRules = ref([
  (v: unknown) => !!v || t("rules.password.required"),
  (v: string) => (v && v.length >= 8) || t("rules.password.min", { min: 8 }),
  (v: string) => (v && v.length <= 16384) || t("rules.password.max", { max: 16384 }),
  (v: string) => (v && (/[a-z]/).test(v)) || t("rules.password.lowercase"),
  (v: string) => (v && (/[A-Z]/).test(v)) || t("rules.password.uppercase"),
  (v: string) => (v && (/\d/).test(v)) || t("rules.password.number"),
  (v: string) => (v && (/[^a-zA-Z0-9]/).test(v)) || t("rules.password.special"),
  (v: string) => (v && v === state.password) || t("rules.password.match"),
])

const turnstileKey = disabledFeaturesList.value["turnstile"]
  ? "1x00000000000000000000AA"
  : config.public.turnstileSiteKey

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

const initialState = {
  username: "",
  email: "",
  password: "",
  passwordConfirm: "",
}

const state = reactive({ ...initialState })

async function clear() {
  Object.assign(state, initialState)
  await form.value?.reset()
  turnstileRef.value?.reset()

  if (!disabledFeaturesList.value["turnstile"]) {
    btnDisabled.value = true
  }

  turnstileToken.value = ""
}

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

function onTurnstileSuccess(token: string) {
  if (lastErrorTurnstile.value) {
    lastErrorTurnstile.value = false
    errorMessage.value = ""
    issueMessage.value = ""
  }

  btnDisabled.value = false
  turnstileToken.value = token
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

async function signup() {
  errorMessage.value = ""
  issueMessage.value = ""
  loading.value = true

  const start = performance.now()

  const { error } = await authClient.signUp.email({
    email: state.email,
    name: state.username,
    password: state.password,
    username: state.username,
    displayUsername: state.username,
    fetchOptions: {
      headers: {
        "x-captcha-response": turnstileToken.value,
      },
    },
    callbackURL: "/app",
  })

  if (error) {
    lastErrorTurnstile.value = false
    handleError(error)

    void logUiEvent({
      action: "auth.signup",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
    })
  } else {
    void logUiEvent({
      action: "auth.signup",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
    })
    await navigateTo("/app", { redirectCode: 302 })
  }

  loading.value = false
}

async function submit() {
  await signup()
  await clear()
}

onMounted(() => {
  if (disabledFeaturesList.value["turnstile"]) {
    btnDisabled.value = false
  }
})
</script>

<style lang="scss" scoped>
.vue-turnstile {
  justify-self: center;
  margin-bottom: 16px;
}

.login-root {
  position: relative;
  padding-top: 8px;
}

.login-btn {
  position: relative;
  overflow: visible;
}

.v-btn-group,
.v-btn-group--horizontal {
  overflow: visible;
}
</style>

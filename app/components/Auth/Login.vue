<template>
  <div class="w-100 login-root">
    <v-expand-transition>
      <LayoutAlert
        v-if="errorMessage"
        :message="errorMessage"
        :issue="issueMessage"
        :color="messageColor"
        class="mb-8"
      />
    </v-expand-transition>

    <div v-if="!magicLinkDone">
      <v-btn
        v-if="!disabledFeaturesList['oauth-google']"
        block
        color="primary"
        size="large"
        rounded="xl"
        variant="tonal"
        :loading="loading"
        class="login-btn text-none font-weight-bold mb-4"
        elevation="4"
        prepend-icon="mdi-google"
        @click="socialLogin('google')"
      >
        {{ t('login.google') }}

        <v-chip
          v-if="lastUsedMethod === 'google'"
          class="last-used-chip last-used-chip--single"
          color="secondary"
          prepend-icon="mdi-history"
          pill
        >
          {{ t('login.last-used') }}
        </v-chip>
      </v-btn>
      <v-btn
        v-if="!disabledFeaturesList['oauth-github']"
        block
        color="primary"
        size="large"
        rounded="xl"
        variant="tonal"
        :loading="loading"
        class="login-btn text-none font-weight-bold mb-4"
        elevation="4"
        prepend-icon="mdi-github"
        @click="socialLogin('github')"
      >
        {{ t('login.github') }}

        <v-chip
          v-if="lastUsedMethod === 'github'"
          class="last-used-chip last-used-chip--single"
          color="secondary"
          prepend-icon="mdi-history"
          pill
        >
          {{ t('login.last-used') }}
        </v-chip>
      </v-btn>

      <div class="d-flex flex-column align-center py-4">
        <v-btn-toggle
          v-model="loginMethod"
          class="login-toggle"
          color="primary"
          rounded="xl"
          mandatory
          divided
          border
          variant="outlined"
        >
          <v-btn
            size="small"
            prepend-icon="mdi-account-circle-outline"
            value="username"
            class="login-toggle-btn text-none"
          >
            {{ t('login.username') }}

            <v-chip
              v-if="lastUsedMethod === 'username'"
              class="last-used-chip last-used-chip--group"
              :color="loginMethod === lastUsedMethod ? 'primary' : 'secondary'"
              prepend-icon="mdi-history"
              pill
            >
              {{ t('login.last-used') }}
            </v-chip>
          </v-btn>
          <v-btn
            size="small"
            prepend-icon="mdi-email-outline"
            value="email"
            class="login-toggle-btn text-none"
          >
            {{ t('login.email') }}

            <v-chip
              v-if="lastUsedMethod === 'email'"
              class="last-used-chip last-used-chip--group"
              :color="loginMethod === lastUsedMethod ? 'primary' : 'secondary'"
              prepend-icon="mdi-history"
              pill
            >
              {{ t('login.last-used') }}
            </v-chip>
          </v-btn>
          <v-btn
            v-if="!disabledFeaturesList['magic-link']"
            size="small"
            prepend-icon="mdi-mailbox-open-up-outline"
            value="magic-link"
            class="login-toggle-btn text-none"
          >
            {{ t('login.magic-link') }}

            <v-chip
              v-if="lastUsedMethod === 'magic-link'"
              class="last-used-chip last-used-chip--group"
              :color="loginMethod === lastUsedMethod ? 'primary' : 'secondary'"
              prepend-icon="mdi-history"
              pill
            >
              {{ t('login.last-used') }}
            </v-chip>
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-form
        ref="form"
        @submit.prevent="submit"
      >
        <div class="mb-4">
          <v-text-field
            v-if="loginMethod === 'username'"
            v-model="state.username"
            variant="outlined"
            color="primary"
            rounded="lg"
            :label="t('login.username')"
            :rules="usernameRules"
            prepend-inner-icon="mdi-account-circle-outline"
            hide-details="auto"
          />
          <v-text-field
            v-else
            v-model="state.email"
            variant="outlined"
            color="primary"
            rounded="lg"
            :label="t('login.email')"
            :rules="emailRules"
            prepend-inner-icon="mdi-email-outline"
            hide-details="auto"
          />
        </div>

        <div
          v-if="loginMethod !== 'magic-link'"
          class="mb-6"
        >
          <v-text-field
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            color="primary"
            rounded="lg"
            :label="t('login.password')"
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

        <v-btn
          block
          color="primary"
          size="large"
          rounded="xl"
          type="submit"
          variant="flat"
          :loading="loading"
          :disabled="!form?.isValid || loading"
          :prepend-icon="loginMethod === 'magic-link' ? 'mdi-mailbox-open-up-outline' : 'mdi-login'"
          class="text-none font-weight-bold glow-button"
        >
          {{ t('login.login') }}
        </v-btn>
      </v-form>
    </div>

    <NuxtLink to="/signup">
      <v-btn
        block
        color="primary"
        size="large"
        rounded="xl"
        type="submit"
        variant="tonal"
        prepend-icon="mdi-login-variant"
        class="text-none font-weight-bold mt-4"
      >
        {{ t('signup.signup') }}
      </v-btn>
    </NuxtLink>

    <NuxtLink
      v-if="!disabledFeaturesList['email']"
      to="/reset-password"
    >
      <v-btn
        block
        color="primary"
        size="large"
        rounded="xl"
        type="submit"
        variant="tonal"
        prepend-icon="mdi-lock-reset"
        class="text-none font-weight-bold mt-4"
      >
        {{ t('reset-password.question') }}
      </v-btn>
    </NuxtLink>
  </div>
</template>

<script lang="ts" setup>
import type {
  ComponentInternalInstance,
  Raw,
} from "vue"

const { t } = useI18n()
const { logUiEvent } = useUiEventLogger()

const lastUsedMethod = computed(() => authClient.getLastUsedLoginMethod())
const disabledFeaturesList = computed(() => disabledFeatures())
const errorMessage = ref("")
const issueMessage = ref("")
const messageColor = ref("error")
const showPassword = ref(false)
const loading = ref(false)
const form = ref<{
  id: number | string;
  validate: () => Promise<string[]>;
  reset: () => Promise<void>;
  resetValidation: () => Promise<void>;
  vm: Raw<ComponentInternalInstance>;
  isValid: boolean | null;
  errorMessages: string[];
}>()
const loginMethod = ref<"username" | "email" | "magic-link">("username")
const magicLinkDone = ref(false)

const emailRules = ref([
  (v: unknown) => !!v || t("rules.email.required"),
  (v: string) => (v && (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(v)) || t("rules.email.valid"),
])

const usernameRules = ref([
  (v: unknown) => !!v || t("rules.username.required"),
  (v: string) => (v && v.trim().length >= 3) || t("rules.username.min", { min: 3 }),
  (v: string) => (v && (/^[a-zA-Z0-9_]+$/).test(v.trim())) || t("rules.username.alphanumeric"),
])

const passwordRules = ref([
  (v: unknown) => !!v || t("rules.password.required"),
  (v: string) => (v && v.length >= 8) || t("rules.password.min", { min: 8 }),
])

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

const initialState = {
  username: "",
  email: "",
  password: "",
}

const state = reactive({ ...initialState })

async function clear() {
  Object.assign(state, initialState)
  await form.value?.reset()
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

async function usernameLogin() {
  errorMessage.value = ""
  issueMessage.value = ""
  loading.value = true

  const start = performance.now()

  const { error } = await authClient.signIn.username({
    username: state.username,
    password: state.password,
    callbackURL: "/app",
  })

  if (error) {
    handleError(error)
    loading.value = false

    void logUiEvent({
      action: "auth.login.username",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
    })
  } else {
    void logUiEvent({
      action: "auth.login.username",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
    })
    await navigateTo("/app", { redirectCode: 302 })
  }
}

async function emailLogin() {
  errorMessage.value = ""
  issueMessage.value = ""
  loading.value = true

  const start = performance.now()

  const { error } = await authClient.signIn.email({
    email: state.email,
    password: state.password,
    callbackURL: "/app",
  })

  if (error) {
    handleError(error)
    loading.value = false

    void logUiEvent({
      action: "auth.login.email",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
    })
  } else {
    void logUiEvent({
      action: "auth.login.email",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
    })
    await navigateTo("/app", { redirectCode: 302 })
  }
}

async function socialLogin(provider: "google" | "github") {
  errorMessage.value = ""
  issueMessage.value = ""
  loading.value = true

  const start = performance.now()

  const { error } = await authClient.signIn.social({
    provider,
    callbackURL: "/app",
  })

  if (error) {
    handleError(error)
    loading.value = false

    void logUiEvent({
      action: "auth.login.oauth",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        provider,
      },
    })
  } else {
    void logUiEvent({
      action: "auth.login.oauth",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        provider,
      },
    })
  }
}

async function magicLinkLogin() {
  errorMessage.value = ""
  issueMessage.value = ""
  loading.value = true

  const start = performance.now()

  const {
    data, error,
  } = await authClient.signIn.magicLink({
    email: state.email,
    callbackURL: "/app",
    newUserCallbackURL: "/app",
    errorCallbackURL: "/error",
  })

  if (error) {
    handleError(error)

    void logUiEvent({
      action: "auth.magic_link.request",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
    })
  } else {
    messageColor.value = "success"
    errorMessage.value = t("login.magic-link-success")
    issueMessage.value = ""
    magicLinkDone.value = true

    void logUiEvent({
      action: "auth.magic_link.request",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
    })
  }

  loading.value = false
}

async function submit() {
  switch (loginMethod.value) {
    case "username": {
      await usernameLogin()

      break
    } case "email": {
      await emailLogin()

      break
    } case "magic-link": {
      await magicLinkLogin()

      break
    } default: {
      // do nothing
      void 0
    }
  }

  await clear()
}
</script>

<style lang="scss" scoped>
.login-root {
  position: relative;
  padding-top: 8px;
}

.login-btn,
.login-toggle-btn {
  position: relative;
  overflow: visible;
}

.last-used-chip {
  position: absolute;
  z-index: 2;
  pointer-events: none;
  font-size: 0.75rem;
  line-height: 1;
  max-width: none;
  width: max-content;
  overflow: visible;

  &--single {
    top: 0;
    right: 0.5rem;
    transform: translateY(-55%);
  }

  &--group {
    top: 0;
    left: 50%;
    transform: translate(-50%, -55%);
  }

  .v-chip__content {
    overflow: visible;
    text-overflow: clip;
    white-space: nowrap;
  }
}

.login-toggle,
.v-btn-group,
.v-btn-group--horizontal {
  overflow: visible;
}
</style>

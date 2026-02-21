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

    <div
      v-if="disabledFeatures()['email']"
      class="d-flex flex-column align-center"
    >
      <LayoutAlert
        :message="t('account.disabled')"
        color="warning"
      />
    </div>

    <div
      v-else-if="resetDone"
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
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          color="primary"
          rounded="lg"
          :label="t('reset-password.new-password')"
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
          :label="t('reset-password.password-confirm')"
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

      <v-btn
        block
        color="primary"
        size="large"
        rounded="xl"
        type="submit"
        variant="flat"
        :loading="loading"
        :disabled="!form?.isValid"
        prepend-icon="mdi-lock-reset"
        class="text-none font-weight-bold glow-button"
      >
        {{ t('reset-password.reset') }}
      </v-btn>
    </v-form>
  </div>
</template>

<script lang="ts" setup>
import type {
  ComponentInternalInstance,
  Raw,
} from "vue"

const props = defineProps<{ token: string }>()

const { t } = useI18n()
const { logUiEvent } = useUiEventLogger()

const errorMessage = ref("")
const issueMessage = ref("")
const messageColor = ref("error")
const showPassword = ref(false)
const loading = ref(false)
const resetDone = ref(false)
const form = ref<{
  id: number | string;
  validate: () => Promise<string[]>;
  reset: () => Promise<void>;
  resetValidation: () => Promise<void>;
  vm: Raw<ComponentInternalInstance>;
  isValid: boolean | null;
  errorMessages: string[];
}>()

const passwordRules = ref([
  (v: unknown) => !!v || t("rules.password.required"),
  (v: string) => (v && v.length >= 8) || t("rules.password.min", { min: 8 }),
  (v: string) => (v && v.length <= 16384) || t("rules.password.max", { max: 16384 }),
  (v: string) => (v && (/[a-z]/).test(v)) || t("rules.password.lowercase"),
  (v: string) => (v && (/[A-Z]/).test(v)) || t("rules.password.uppercase"),
  (v: string) => (v && (/\d/).test(v)) || t("rules.password.number"),
  (v: string) => (v && (/[^a-zA-Z0-9]/).test(v)) || t("rules.password.special"),
])

const initialState = {
  password: "",
  passwordConfirm: "",
}

const state = reactive({ ...initialState })

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

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
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

async function resetPassword() {
  errorMessage.value = ""
  issueMessage.value = ""
  loading.value = true

  const start = performance.now()

  const { error } = await authClient.resetPassword({
    newPassword: state.password,
    token: props.token,
  })

  if (error) {
    handleError(error)

    void logUiEvent({
      action: "auth.password_reset.complete",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
    })
  } else {
    messageColor.value = "success"
    errorMessage.value = t("reset-password.reset-success")
    issueMessage.value = ""
    resetDone.value = true

    void logUiEvent({
      action: "auth.password_reset.complete",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
    })
  }

  loading.value = false
}

async function submit() {
  await resetPassword()
}
</script>

<style lang="scss" scoped>
.login-root {
  position: relative;
  padding-top: 8px;
}
</style>

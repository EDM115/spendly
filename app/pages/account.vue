<template>
  <v-container
    class="account-container"
    fluid
  >
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex flex-column flex-md-row align-start align-md-center justify-space-between gap-4 mx-8">
          <div>
            <h1 class="text-h4 font-weight-bold mb-1">
              {{ t("account.title") }}
            </h1>
            <p class="text-body-1 text-medium-emphasis">
              {{ t("account.subtitle") }}
            </p>
          </div>
          <div class="d-flex flex-column align-start align-md-end gap-2 mt-4 mt-md-0">
            <v-chip
              v-if="currentUserEmail"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-email-outline"
            >
              {{ currentUserEmail }}
            </v-chip>
            <v-chip
              v-if="currentUsername"
              color="secondary"
              variant="tonal"
              class="mt-2"
              prepend-icon="mdi-account-circle-outline"
            >
              {{ currentUsername }}
            </v-chip>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="glass-card pa-6"
          rounded="xl"
          elevation="0"
        >
          <div class="mb-4">
            <h2 class="text-h5 font-weight-bold">
              {{ t("account.profile.title") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis">
              {{ t("account.profile.description") }}
            </p>
          </div>

          <v-form
            ref="usernameForm"
            @submit.prevent="submitUsername"
          >
            <v-text-field
              v-model="usernameState.username"
              variant="outlined"
              color="primary"
              rounded="lg"
              :label="t('account.profile.username')"
              :rules="usernameRules"
              prepend-inner-icon="mdi-account-circle-outline"
              hide-details="auto"
            />

            <v-btn
              block
              color="primary"
              size="large"
              rounded="xl"
              type="submit"
              variant="flat"
              :loading="usernameLoading"
              :disabled="!usernameForm?.isValid || usernameLoading || usernameState.username === currentUsername"
              prepend-icon="mdi-account-edit-outline"
              class="text-none font-weight-bold mt-4"
            >
              {{ t("account.profile.update") }}
            </v-btn>
          </v-form>

          <v-expand-transition>
            <LayoutAlert
              v-if="usernameFeedback.message"
              :message="usernameFeedback.message"
              :issue="usernameFeedback.issue"
              :color="usernameFeedback.color"
            />
          </v-expand-transition>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="glass-card pa-6"
          rounded="xl"
          elevation="0"
        >
          <div class="mb-4">
            <h2 class="text-h5 font-weight-bold">
              {{ t("account.email.title") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis">
              {{ t("account.email.description") }}
            </p>
          </div>

          <v-form
            ref="emailForm"
            @submit.prevent="submitEmail"
          >
            <v-text-field
              v-model="emailState.newEmail"
              variant="outlined"
              color="primary"
              rounded="lg"
              :label="t('account.email.new')"
              :rules="emailRules"
              prepend-inner-icon="mdi-email-outline"
              hide-details="auto"
            />

            <v-btn
              block
              color="primary"
              size="large"
              rounded="xl"
              type="submit"
              variant="flat"
              :loading="emailLoading"
              :disabled="!emailForm?.isValid || emailLoading"
              prepend-icon="mdi-email-fast-outline"
              class="text-none font-weight-bold mt-4"
            >
              {{ t("account.email.request") }}
            </v-btn>
          </v-form>

          <v-expand-transition>
            <LayoutAlert
              v-if="emailFeedback.message"
              :message="emailFeedback.message"
              :issue="emailFeedback.issue"
              :color="emailFeedback.color"
            />
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="glass-card pa-6"
          rounded="xl"
          elevation="0"
        >
          <div class="mb-4">
            <h2 class="text-h5 font-weight-bold">
              {{ t("account.security.title") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis">
              {{ t("account.security.description") }}
            </p>
          </div>

          <v-form
            ref="passwordForm"
            @submit.prevent="submitPasswordReset"
          >
            <v-text-field
              v-model="passwordState.currentPassword"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              color="primary"
              rounded="lg"
              :label="t('account.security.current-password')"
              :rules="passwordRules"
              prepend-inner-icon="mdi-key-outline"
              hide-details="auto"
              class="mb-4"
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

            <v-text-field
              v-model="passwordState.newPassword"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              color="primary"
              rounded="lg"
              :label="t('account.security.new-password')"
              :rules="passwordRules"
              prepend-inner-icon="mdi-lock-plus-outline"
              hide-details="auto"
              class="mb-4"
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

            <v-text-field
              v-model="passwordState.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              variant="outlined"
              color="primary"
              rounded="lg"
              :label="t('account.security.confirm-password')"
              :rules="passwordConfirmRules"
              prepend-inner-icon="mdi-lock-check-outline"
              hide-details="auto"
              class="mb-4"
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

            <v-btn
              block
              color="primary"
              size="large"
              rounded="xl"
              type="submit"
              variant="flat"
              :loading="passwordLoading"
              :disabled="!passwordForm?.isValid"
              prepend-icon="mdi-lock-reset"
              class="text-none font-weight-bold"
            >
              {{ t("account.security.request") }}
            </v-btn>
          </v-form>

          <v-expand-transition>
            <LayoutAlert
              v-if="passwordFeedback.message"
              :message="passwordFeedback.message"
              :issue="passwordFeedback.issue"
              :color="passwordFeedback.color"
            />
          </v-expand-transition>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <v-card
          class="glass-card pa-6"
          rounded="xl"
          elevation="0"
        >
          <div class="mb-4">
            <h2 class="text-h5 font-weight-bold">
              {{ t("account.oauth.title") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis">
              {{ t("account.oauth.description") }}
            </p>
          </div>

          <v-list class="bg-transparent pa-0">
            <v-list-item
              class="oauth-item rounded-lg mb-3 py-2"
              variant="outlined"
            >
              <template #prepend>
                <v-avatar
                  color="primary"
                  variant="tonal"
                >
                  <v-icon icon="mdi-google" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-semibold">
                {{ formatProviderLabel("google") }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ linkedProviders.has('google') ? t('account.oauth.linked') : t('account.oauth.not-linked') }}
              </v-list-item-subtitle>
              <template #append>
                <v-btn
                  :color="linkedProviders.has('google') ? 'error' : 'primary'"
                  variant="tonal"
                  rounded="lg"
                  class="text-none font-weight-bold my-2"
                  :prepend-icon="linkedProviders.has('google') ? 'mdi-link-variant-off' : 'mdi-link-variant'"
                  :loading="oauthLoading === 'google'"
                  @click="linkedProviders.has('google') ? unlinkProvider('google') : linkProvider('google')"
                >
                  {{ linkedProviders.has('google') ? t('account.oauth.unlink') : t('account.oauth.link') }}
                </v-btn>
              </template>
            </v-list-item>

            <v-list-item
              class="oauth-item rounded-lg py-2"
              variant="outlined"
            >
              <template #prepend>
                <v-avatar
                  color="primary"
                  variant="tonal"
                >
                  <v-icon icon="mdi-github" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-semibold">
                {{ formatProviderLabel("github") }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ linkedProviders.has('github') ? t('account.oauth.linked') : t('account.oauth.not-linked') }}
              </v-list-item-subtitle>
              <template #append>
                <v-btn
                  :color="linkedProviders.has('github') ? 'error' : 'primary'"
                  variant="tonal"
                  rounded="lg"
                  class="text-none font-weight-bold my-2"
                  :prepend-icon="linkedProviders.has('github') ? 'mdi-link-variant-off' : 'mdi-link-variant'"
                  :loading="oauthLoading === 'github'"
                  @click="linkedProviders.has('github') ? unlinkProvider('github') : linkProvider('github')"
                >
                  {{ linkedProviders.has('github') ? t('account.oauth.unlink') : t('account.oauth.link') }}
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <v-expand-transition>
            <LayoutAlert
              v-if="oauthFeedback.message"
              :message="oauthFeedback.message"
              :issue="oauthFeedback.issue"
              :color="oauthFeedback.color"
            />
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card
          class="glass-card pa-6"
          rounded="xl"
          elevation="0"
        >
          <div class="mb-4">
            <h2 class="text-h5 font-weight-bold">
              {{ t("account.data.title") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis">
              {{ t("account.data.description") }}
            </p>
          </div>

          <div class="d-flex flex-column flex-md-row gap-4">
            <v-btn
              color="primary"
              variant="tonal"
              rounded="xl"
              prepend-icon="mdi-download-outline"
              class="text-none font-weight-bold mr-0 mr-md-4"
              :loading="requestLoading === 'export'"
              :disabled="hasPendingExport || requestLoading === 'export'"
              @click="requestExport"
            >
              {{ t("account.data.export") }}
            </v-btn>
            <v-btn
              color="error"
              variant="tonal"
              rounded="xl"
              prepend-icon="mdi-account-remove-outline"
              class="text-none font-weight-bold mt-4 mt-md-0"
              :loading="requestLoading === 'delete'"
              :disabled="hasPendingDelete || requestLoading === 'delete'"
              @click="requestDeletion"
            >
              {{ t("account.data.delete") }}
            </v-btn>
          </div>

          <v-expand-transition>
            <LayoutAlert
              v-if="dataFeedback.message"
              :message="dataFeedback.message"
              :issue="dataFeedback.issue"
              :color="dataFeedback.color"
            />
          </v-expand-transition>
          <v-expand-transition>
            <LayoutAlert
              v-if="hasPendingExport || hasPendingDelete"
              :message="t('account.data.request-pending-tooltip')"
              color="info"
            />
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="showExportDialog"
      max-width="560"
      persistent
    >
      <v-card class="glass-card pa-1 border-thin">
        <v-card-title class="text-h6 font-weight-bold">
          {{ t("account.data.export-dialog.title") }}
        </v-card-title>
        <v-card-text>
          {{ t("account.data.export-dialog.description", { email: currentUserEmail || t("account.data.fallback-email") }) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            rounded="lg"
            variant="text"
            @click="showExportDialog = false"
          >
            {{ t("account.data.export-dialog.cancel") }}
          </v-btn>
          <v-btn
            color="primary"
            rounded="lg"
            variant="elevated"
            @click="confirmExport"
          >
            {{ t("account.data.export-dialog.confirm") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="showDeletionDialog"
      max-width="560"
      persistent
    >
      <v-card class="glass-card pa-1 border-thin">
        <v-card-title class="text-h6 text-error font-weight-bold">
          {{ t("account.data.delete-dialog.title") }}
        </v-card-title>
        <v-card-text>
          {{ t("account.data.delete-dialog.description") }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="secondary"
            rounded="lg"
            variant="text"
            @click="showDeletionDialog = false"
          >
            {{ t("account.data.delete-dialog.cancel") }}
          </v-btn>
          <v-btn
            color="error"
            rounded="lg"
            variant="elevated"
            @click="confirmDeletion"
          >
            {{ t("account.data.delete-dialog.confirm") }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="d-flex justify-center my-10">
      <v-divider
        class="w-50"
        thickness="2"
        opacity="0.6"
      />
    </div>

    <v-row>
      <v-col cols="12">
        <v-card
          class="glass-card pa-6"
          rounded="xl"
          elevation="0"
        >
          <div class="mb-4 text-center">
            <h2 class="text-h5 font-weight-bold mb-4">
              {{ t("account.donation.title") }}
            </h2>
            <p class="text-body-2 text-medium-emphasis">
              {{ t("account.donation.description") }}
            </p>
          </div>

          <div class="d-flex flex-column flex-md-row justify-center gap-4">
            <v-btn
              color="primary"
              variant="tonal"
              rounded="xl"
              prepend-icon="mdi-hand-coin-outline"
              class="text-none font-weight-bold mr-0 mr-md-4"
              href="https://paypal.me/8EDM115"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t("account.donation.paypal") }}
            </v-btn>
            <v-btn
              color="primary"
              variant="tonal"
              rounded="xl"
              prepend-icon="mdi-coffee-outline"
              class="text-none font-weight-bold mr-0 mr-md-4 mt-4 mt-md-0"
              href="https://www.buymeacoffee.com/edm115"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t("account.donation.coffee") }}
            </v-btn>
            <v-btn
              color="primary"
              variant="tonal"
              rounded="xl"
              prepend-icon="mdi-github"
              class="text-none font-weight-bold mt-4 mt-md-0"
              href="https://github.com/sponsors/EDM115"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t("account.donation.github") }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type {
  ComponentInternalInstance,
  Raw,
} from "vue"

import { authClient } from "~/utils/authClient"

const store = useMainStore()
const { t } = useI18n()
const { logUiEvent } = useUiEventLogger()

useHead({ title: t("main.account") })

const currentUser = computed(() => store.getUser)
const currentUserEmail = computed(() => currentUser.value?.email ?? "")
const currentUsername = computed(() => currentUser.value?.displayUsername ?? currentUser.value?.name ?? "")

const usernameLoading = ref(false)
const emailLoading = ref(false)
const passwordLoading = ref(false)
const oauthLoading = ref<"google" | "github" | null>(null)
const showPassword = ref(false)

const usernameForm = ref<{
  id: number | string;
  validate: () => Promise<string[]>;
  reset: () => Promise<void>;
  resetValidation: () => Promise<void>;
  vm: Raw<ComponentInternalInstance>;
  isValid: boolean | null;
  errorMessages: string[];
}>()

const emailForm = ref<{
  id: number | string;
  validate: () => Promise<string[]>;
  reset: () => Promise<void>;
  resetValidation: () => Promise<void>;
  vm: Raw<ComponentInternalInstance>;
  isValid: boolean | null;
  errorMessages: string[];
}>()

const passwordForm = ref<{
  id: number | string;
  validate: () => Promise<string[]>;
  reset: () => Promise<void>;
  resetValidation: () => Promise<void>;
  vm: Raw<ComponentInternalInstance>;
  isValid: boolean | null;
  errorMessages: string[];
}>()

const usernameState = reactive({
  username: "",
})

const emailState = reactive({
  newEmail: "",
})

const passwordState = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
})

const usernameFeedback = reactive({
  message: "",
  issue: "",
  color: "error",
})

const emailFeedback = reactive({
  message: "",
  issue: "",
  color: "error",
})

const passwordFeedback = reactive({
  message: "",
  issue: "",
  color: "error",
})

const oauthFeedback = reactive({
  message: "",
  issue: "",
  color: "error",
})

const dataFeedback = reactive({
  message: "",
  issue: "",
  color: "warning",
})

type UserRequestType = "export" | "delete"

type UserRequestEntry = {
  id: string;
  type: UserRequestType;
  request_date: string | Date;
}

type UserRequestListResponse = {
  body: {
    success: string;
    requests: UserRequestEntry[];
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> => !!value
  && typeof value === "object"
  && Object.getPrototypeOf(value) === Object.prototype

const isUserRequestEntry = (value: unknown): value is UserRequestEntry => {
  if (!isRecord(value)) {
    return false
  }

  const type = value.type

  return typeof value.id === "string"
    && (type === "export" || type === "delete")
    && "request_date" in value
}

const isUserRequestListResponse = (value: unknown): value is UserRequestListResponse => {
  if (!isRecord(value) || !isRecord(value.body)) {
    return false
  }

  const requests = value.body.requests

  return Array.isArray(requests)
}

const getDuplicateFlag = (value: unknown): boolean => {
  if (!isRecord(value) || !isRecord(value.body)) {
    return false
  }

  return typeof value.body.duplicate === "boolean"
    ? value.body.duplicate
    : false
}

const extractUserRequests = (value: unknown): UserRequestEntry[] => {
  if (!isUserRequestListResponse(value)) {
    return []
  }

  return value.body.requests.filter(isUserRequestEntry)
}

const requestLoading = ref<UserRequestType | null>(null)
const userRequests = ref<UserRequestEntry[]>([])

const hasPendingExport = computed(() => userRequests.value.some((entry) => entry.type === "export"))
const hasPendingDelete = computed(() => userRequests.value.some((entry) => entry.type === "delete"))

const showExportDialog = ref(false)
const showDeletionDialog = ref(false)

const oauthExtraData = ref<Record<string, {
  name?: string; email?: string;
}>>({})
const linkedAccounts = ref<Array<{
  scopes: string[];
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  providerId: string;
  accountId: string;
}>>([])
const linkedProviders = computed(() => new Set(linkedAccounts.value.map((account) => account.providerId)))

const emailRules = ref([
  (v: unknown) => !!v || t("rules.email.required"),
  (v: string) => (v && (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(v)) || t("rules.email.valid"),
])

async function usernameAvailable(name: string) {
  const normalized = name?.trim()

  if (!normalized || normalized === currentUsername.value) {
    return true
  }

  const {
    data, error,
  } = await authClient.isUsernameAvailable({
    username: normalized,
  })

  return error
    ? false
    : data?.available ?? false
}

const usernameRules = ref([
  (v: unknown) => !!v || t("rules.username.required"),
  (v: string) => (v && v.length >= 3) || t("rules.username.min", { min: 3 }),
  (v: string) => (v && v.length <= 128) || t("rules.username.max", { max: 128 }),
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
  (v: string) => (v && v === passwordState.newPassword) || t("rules.password.match"),
])

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const resetFeedback = (target: typeof usernameFeedback) => {
  target.message = ""
  target.issue = ""
  target.color = "error"
}

const applyError = (target: typeof usernameFeedback, error: {
  message?: string;
  statusText?: string;
  code?: string;
}, color = "error") => {
  target.color = color
  target.message = error.message ?? error.code ?? t("error.unknown")
  target.issue = error.statusText ?? ""
}

const applySuccess = (target: typeof usernameFeedback, message: string) => {
  target.color = "success"
  target.message = message
  target.issue = ""
}

const resetDataFeedback = () => {
  dataFeedback.message = ""
  dataFeedback.issue = ""
  dataFeedback.color = "warning"
}

const applyDataSuccess = (message: string) => {
  dataFeedback.color = "success"
  dataFeedback.message = message
  dataFeedback.issue = ""
}

async function submitUsername() {
  resetFeedback(usernameFeedback)
  usernameLoading.value = true

  const { error } = await authClient.updateUser({
    name: usernameState.username,
    username: usernameState.username,
    displayUsername: usernameState.username,
  })

  if (error) {
    applyError(usernameFeedback, error)
  } else {
    applySuccess(usernameFeedback, t("account.profile.success"))
    await authClient.getSession()
  }

  usernameLoading.value = false
}

async function submitEmail() {
  resetFeedback(emailFeedback)
  emailLoading.value = true

  const { error } = await authClient.changeEmail({
    newEmail: emailState.newEmail,
    callbackURL: "/account",
  })

  if (error) {
    applyError(emailFeedback, error)
  } else {
    applySuccess(emailFeedback, t("account.email.success"))
    await emailForm.value?.reset()
    await authClient.getSession()
  }

  emailLoading.value = false
}

async function submitPasswordReset() {
  resetFeedback(passwordFeedback)
  passwordLoading.value = true

  try {
    await authClient.changePassword({
      newPassword: passwordState.newPassword,
      currentPassword: passwordState.currentPassword,
      revokeOtherSessions: true,
    })

    applySuccess(passwordFeedback, t("account.security.success"))
    await passwordForm.value?.reset()
  } catch (error) {
    const normalized = error as {
      data?: { message?: string };
      statusText?: string;
      message?: string;
    }

    applyError(passwordFeedback, {
      message: normalized.data?.message ?? normalized.message,
      statusText: normalized.statusText,
    })
  }

  passwordLoading.value = false
}

async function refreshLinkedAccounts() {
  resetFeedback(oauthFeedback)

  const {
    data, error,
  } = await authClient.listAccounts()

  if (error) {
    applyError(oauthFeedback, error)
    linkedAccounts.value = []

    return
  }

  linkedAccounts.value = data

  const infoPromises = data.map(async (account) => {
    const { data: info } = await authClient.accountInfo({
      query: {
        accountId: account.accountId,
      },
    })

    return {
      provider: account.providerId,
      info,
    }
  })

  const infos = await Promise.all(infoPromises)

  infos.forEach(({
    provider, info,
  }) => {
    if (info?.user) {
      oauthExtraData.value[provider] = {
        name: info.user.name ?? undefined,
        email: info.user.email ?? undefined,
      }
    }
  })
}

const formatProviderLabel = (provider: "google" | "github") => {
  const baseLabel = provider === "google"
    ? t("account.oauth.google")
    : t("account.oauth.github")
  const info = oauthExtraData.value[provider]
  const details = [ info?.name, info?.email ].filter(Boolean)
    .join(", ")

  return details
    ? `${baseLabel} (${details})`
    : baseLabel
}

async function linkProvider(provider: "google" | "github") {
  resetFeedback(oauthFeedback)
  oauthLoading.value = provider

  const { error } = await authClient.linkSocial({
    provider,
    callbackURL: "/account",
  })

  if (error) {
    applyError(oauthFeedback, error)
    oauthLoading.value = null
  }
}

async function unlinkProvider(provider: "google" | "github") {
  resetFeedback(oauthFeedback)
  oauthLoading.value = provider

  const { error } = await authClient.unlinkAccount({
    providerId: provider,
  })

  if (error) {
    applyError(oauthFeedback, error)
  } else {
    applySuccess(oauthFeedback, t("account.oauth.unlinked"))
    await refreshLinkedAccounts()
  }

  oauthLoading.value = null
}

function requestExport() {
  if (hasPendingExport.value) {
    return
  }

  showExportDialog.value = true
}

function requestDeletion() {
  if (hasPendingDelete.value) {
    return
  }

  showDeletionDialog.value = true
}

async function confirmExport() {
  showExportDialog.value = false
  await submitUserRequest("export")
}

async function confirmDeletion() {
  showDeletionDialog.value = false
  await submitUserRequest("delete")
}

async function fetchUserRequests() {
  resetDataFeedback()

  try {
    const response = await $fetch("/api/userRequest")
    const requests = extractUserRequests(response)

    userRequests.value = requests
  } catch (error) {
    applyError(dataFeedback, error as {
      message?: string; statusText?: string; code?: string;
    }, "warning")
  }
}

async function submitUserRequest(type: UserRequestType) {
  resetDataFeedback()
  requestLoading.value = type
  const start = performance.now()

  try {
    const response = await $fetch("/api/userRequest", {
      method: "POST",
      body: { type },
    })

    const duplicate = getDuplicateFlag(response)

    applyDataSuccess(type === "export"
      ? t("account.data.export-confirmed")
      : t("account.data.delete-confirmed"))

    await fetchUserRequests()

    void logUiEvent({
      action: "ui.account.userRequest",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        request_type: type,
        duplicate,
      },
    })
  } catch (error) {
    applyError(dataFeedback, error as {
      message?: string; statusText?: string; code?: string;
    }, "warning")

    void logUiEvent({
      action: "ui.account.userRequest",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        request_type: type,
      },
    })
  } finally {
    requestLoading.value = null
  }
}

watch(currentUser, (value) => {
  usernameState.username = value?.displayUsername ?? value?.name ?? ""
}, { immediate: true })

onMounted(async () => {
  await refreshLinkedAccounts()
  await fetchUserRequests()
})
</script>

<style lang="scss" scoped>
.account-container {
  padding-top: 64px;
  padding-bottom: 32px;
}

@media (max-width: 600px) {
  .oauth-item.v-list-item {
    grid-template-areas:
      "prepend content"
      "prepend append";
    grid-template-columns: max-content 1fr;
  }

  .oauth-item .v-list-item__append {
    justify-self: start;
  }
}
</style>

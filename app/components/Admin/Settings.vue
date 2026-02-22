<template>
  <div class="d-flex align-center mb-6">
    <v-icon
      icon="mdi-shield-account-outline"
      size="32"
      color="primary"
      class="mr-3"
    />
    <h1 class="text-h4 font-weight-bold gradient-text pb-0">
      {{ t("admin.title") }}
    </h1>
  </div>

  <v-expansion-panels
    variant="accordion"
    class="glass-accordion mb-6"
  >
    <v-expansion-panel
      class="glass-panel rounded-xl overflow-hidden transparent-panel"
      elevation="0"
    >
      <v-expansion-panel-title class="font-weight-bold text-h6 py-4">
        <v-icon
          icon="mdi-account-group-outline"
          class="mr-3"
          color="primary"
        />
        {{ t("admin.users.title") }} ({{ users.length }})
        <v-spacer />
        <v-btn
          color="primary"
          class="mr-4 text-none"
          :rounded="smAndUp ? 'lg' : 'full'"
          variant="tonal"
          :prepend-icon="smAndUp ? 'mdi-account-plus-outline' : undefined"
          :text="smAndUp ? t('admin.users.create') : undefined"
          :icon="smAndUp ? undefined : 'mdi-account-plus-outline'"
          @click.stop="openCreateDialog"
        />
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pt-4">
        <v-expand-transition>
          <v-alert
            v-if="feedback.message"
            :type="feedback.color"
            variant="tonal"
            rounded="lg"
            class="mb-4 mx-4"
            border
          >
            <div class="font-weight-medium">
              {{ feedback.message }}
            </div>
            <div
              v-if="feedback.issue"
              class="text-body-2"
            >
              {{ feedback.issue }}
            </div>
          </v-alert>
        </v-expand-transition>

        <v-list class="bg-transparent">
          <v-list-item
            v-for="userItem in users"
            :key="userItem.id"
            class="mb-2 glass-list-item rounded-lg px-2 mx-4"
          >
            <v-container class="pa-0">
              <v-row
                align="center"
                no-gutters
              >
                <v-col
                  cols="12"
                  md="4"
                  class="pa-2"
                >
                  <v-list-item-title class="font-weight-medium mb-1">
                    <v-icon
                      icon="mdi-account-circle-outline"
                      size="small"
                      class="mr-1 opacity-70"
                    />
                    {{ formatUserLabel(userItem) }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">
                    {{ userItem.email || t("admin.users.no-email") }}
                  </v-list-item-subtitle>
                </v-col>
                <v-col
                  cols="12"
                  md="3"
                  class="pa-2"
                >
                  <v-chip
                    color="secondary"
                    variant="tonal"
                    class="text-uppercase"
                  >
                    {{ formatRole(userItem.role) }}
                  </v-chip>
                </v-col>
                <v-col
                  cols="12"
                  md="5"
                  class="pa-2 d-flex flex-wrap justify-end gap-2"
                >
                  <v-tooltip
                    location="top"
                    :text="t('admin.users.edit-action')"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        :disabled="userItem.id === store.getUserId"
                        color="primary"
                        icon="mdi-pencil-outline"
                        variant="tonal"
                        size="small"
                        :loading="isBusy(userItem.id, 'edit')"
                        @click="openEditDialog(userItem)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip
                    location="top"
                    :text="t('admin.users.impersonate-action')"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        :disabled="userItem.id === store.getUserId"
                        color="warning"
                        class="ml-2"
                        icon="mdi-account-switch-outline"
                        variant="tonal"
                        size="small"
                        :loading="isBusy(userItem.id, 'impersonate')"
                        @click="impersonateUser(userItem)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip
                    location="top"
                    :text="t('admin.users.export-action')"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        color="info"
                        class="ml-2"
                        icon="mdi-folder-zip-outline"
                        variant="tonal"
                        size="small"
                        :loading="isBusy(userItem.id, 'export')"
                        @click="downloadUserExport(userItem)"
                      />
                    </template>
                  </v-tooltip>
                  <v-tooltip
                    location="top"
                    :text="t('admin.users.delete-action')"
                  >
                    <template #activator="{ props: tooltipProps }">
                      <v-btn
                        v-bind="tooltipProps"
                        :disabled="userItem.id === store.getUserId"
                        icon="mdi-delete-outline"
                        color="error"
                        class="ml-2"
                        variant="tonal"
                        size="small"
                        :loading="isBusy(userItem.id, 'delete')"
                        @click="showUserDeleteDialog(userItem)"
                      />
                    </template>
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-container>
          </v-list-item>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel
      class="glass-panel rounded-xl overflow-hidden transparent-panel"
      elevation="0"
    >
      <v-expansion-panel-title class="font-weight-bold text-h6 py-4">
        <v-icon
          icon="mdi-database-outline"
          color="secondary"
          class="mr-3"
        />
        {{ t("admin.backup.title") }}
      </v-expansion-panel-title>
      <v-expansion-panel-text class="px-8 pt-4 pb-6">
        <v-row>
          <v-col
            cols="6"
            sm="3"
          >
            <v-btn
              color="success"
              prepend-icon="mdi-file-delimited-outline"
              :loading="exporting"
              variant="tonal"
              block
              rounded
              class="h-auto py-4"
              @click="downloadBackup('csv')"
            >
              {{ t("admin.backup.export-csv") }}
            </v-btn>
          </v-col>
          <v-col
            cols="6"
            sm="3"
          >
            <v-btn
              color="success"
              prepend-icon="mdi-code-json"
              :loading="exporting"
              variant="tonal"
              block
              rounded
              class="h-auto py-4"
              @click="downloadBackup('json')"
            >
              {{ t("admin.backup.export-json") }}
            </v-btn>
          </v-col>
          <v-col
            cols="6"
            sm="3"
          >
            <v-btn
              color="success"
              prepend-icon="mdi-database-export-outline"
              :loading="exporting"
              variant="tonal"
              block
              rounded
              class="h-auto py-4"
              @click="downloadBackup('sql')"
            >
              {{ t("admin.backup.export-sql") }}
            </v-btn>
          </v-col>
          <v-col
            cols="6"
            sm="3"
          >
            <v-btn
              color="success"
              prepend-icon="mdi-database-arrow-down-outline"
              :loading="exporting"
              variant="tonal"
              block
              rounded
              class="h-auto py-4"
              @click="downloadBackup('sqlite')"
            >
              {{ t("admin.backup.export-sqlite") }}
            </v-btn>
          </v-col>
        </v-row>
      </v-expansion-panel-text>
    </v-expansion-panel>

    <v-expansion-panel
      v-if="!disabledFeatures()['email']"
      class="glass-panel rounded-xl overflow-hidden transparent-panel"
      elevation="0"
    >
      <v-expansion-panel-title class="font-weight-bold text-h6 py-4">
        <v-icon
          icon="mdi-inbox-arrow-down-outline"
          :color="userRequestsIconColor"
          class="mr-3"
        />
        {{ t("admin.user-requests.title") }}
        <template v-if="hasUserRequests">
          ({{ userRequests.length }})
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text class="pt-4">
        <v-alert
          v-if="!hasUserRequests"
          class="mb-4 mx-4"
          variant="tonal"
          rounded="lg"
          type="info"
          border
        >
          {{ t("admin.user-requests.empty") }}
        </v-alert>

        <v-list
          v-else
          class="bg-transparent"
        >
          <v-list-item
            v-for="request in userRequests"
            :key="request.id"
            class="mb-2 glass-list-item rounded-lg px-2 mx-4"
          >
            <v-container class="pa-0">
              <v-row
                align="center"
                no-gutters
              >
                <v-col
                  cols="12"
                  md="4"
                  class="pa-2"
                >
                  <v-list-item-title class="font-weight-medium mb-1">
                    <v-icon
                      icon="mdi-account-circle-outline"
                      size="small"
                      class="mr-1 opacity-70"
                    />
                    {{ formatRequestUser(request) }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-body-2">
                    {{ request.user_email || t("admin.users.no-email") }}
                  </v-list-item-subtitle>
                  <div class="text-caption text-medium-emphasis mt-1">
                    {{ formatRequestDate(request.request_date) }}
                  </div>
                </v-col>
                <v-col
                  cols="12"
                  md="3"
                  class="pa-2"
                >
                  <v-chip
                    :color="request.type === 'export' ? 'info' : 'error'"
                    variant="tonal"
                    class="text-uppercase"
                  >
                    {{ formatRequestType(request.type) }}
                  </v-chip>
                </v-col>
                <v-col
                  cols="12"
                  md="5"
                  class="pa-2 d-flex flex-wrap justify-end gap-2"
                >
                  <v-chip
                    v-if="resolvedRequests[request.id]"
                    color="success"
                    variant="tonal"
                    class="text-uppercase"
                  >
                    {{ resolvedRequests[request.id]?.message }}
                  </v-chip>
                  <template v-else>
                    <v-tooltip
                      location="top"
                      :text="request.type === 'export'
                        ? t('admin.user-requests.export-action')
                        : t('admin.user-requests.delete-action')"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <v-btn
                          v-bind="tooltipProps"
                          :color="request.type === 'export' ? 'info' : 'error'"
                          :icon="request.type === 'export'
                            ? 'mdi-email-fast-outline'
                            : 'mdi-account-remove-outline'"
                          variant="tonal"
                          size="small"
                          :loading="isBusy(request.id, request.type === 'export' ? 'resolve-export' : 'resolve-delete')"
                          @click="openResolveDialog(request)"
                        />
                      </template>
                    </v-tooltip>
                    <v-tooltip
                      location="top"
                      :text="t('admin.user-requests.dismiss-action')"
                    >
                      <template #activator="{ props: tooltipProps }">
                        <v-btn
                          v-bind="tooltipProps"
                          color="secondary"
                          class="ml-2"
                          icon="mdi-close-circle-outline"
                          variant="tonal"
                          size="small"
                          :loading="isBusy(request.id, 'dismiss')"
                          @click="openDismissDialog(request)"
                        />
                      </template>
                    </v-tooltip>
                  </template>
                </v-col>
              </v-row>
            </v-container>
          </v-list-item>
        </v-list>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>

  <v-dialog
    v-model="showResolveDialog"
    max-width="560"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h6 font-weight-bold">
        {{ t("admin.user-requests.resolve-title") }}
      </v-card-title>
      <v-card-text>
        {{ t("admin.user-requests.resolve-description") }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          @click="showResolveDialog = false"
        >
          {{ t("admin.user-requests.resolve-cancel") }}
        </v-btn>
        <v-btn
          color="primary"
          rounded="lg"
          variant="elevated"
          :loading="resolveDialogLoading"
          @click="confirmResolveRequest"
        >
          {{ t("admin.user-requests.resolve-confirm") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showDismissDialog"
    max-width="560"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h6 font-weight-bold">
        {{ t("admin.user-requests.dismiss-title") }}
      </v-card-title>
      <v-card-text>
        {{ t("admin.user-requests.dismiss-description") }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          @click="showDismissDialog = false"
        >
          {{ t("admin.user-requests.dismiss-cancel") }}
        </v-btn>
        <v-btn
          color="error"
          rounded="lg"
          variant="elevated"
          :loading="dismissDialogLoading"
          @click="confirmDismissRequest"
        >
          {{ t("admin.user-requests.dismiss-confirm") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showUserDialog"
    max-width="600"
    persistent
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h6 font-weight-bold">
        {{ isCreating ? t("admin.users.create-title") : t("admin.users.edit-title") }}
      </v-card-title>
      <v-card-text>
        <v-form
          ref="userFormRef"
          @submit.prevent="submitUser"
        >
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="userForm.username"
                :label="t('admin.users.username')"
                variant="outlined"
                rounded="lg"
                autocomplete="suppress"
                prepend-inner-icon="mdi-account-circle-outline"
                hide-details="auto"
                :rules="usernameRules"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="userForm.email"
                :label="t('admin.users.email')"
                variant="outlined"
                rounded="lg"
                autocomplete="suppress"
                prepend-inner-icon="mdi-email-outline"
                hide-details="auto"
                :rules="emailRules"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="userForm.role"
                :items="roleItems"
                :label="t('admin.users.role')"
                variant="outlined"
                prepend-inner-icon="mdi-account-hard-hat-outline"
                hide-details="auto"
                rounded="lg"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="userForm.password"
                :label="t('admin.users.password')"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                rounded="lg"
                autocomplete="new-password"
                hide-details="auto"
                prepend-inner-icon="mdi-key-outline"
                :rules="passwordFieldRules"
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
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="userForm.confirmPassword"
                :label="t('admin.users.confirm-password')"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                rounded="lg"
                autocomplete="new-password"
                hide-details="auto"
                prepend-inner-icon="mdi-key-outline"
                :rules="confirmPasswordRules"
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
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          :text="isCreating ? t('admin.users.create-cancel') : t('admin.users.edit-cancel')"
          @click="closeUserDialog"
        />
        <v-btn
          color="primary"
          rounded="lg"
          variant="elevated"
          :text="isCreating ? t('admin.users.create-confirm') : t('admin.users.edit-confirm')"
          :loading="dialogLoading"
          @click="submitUser"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="showDeleteDialog"
    persistent
    max-width="500"
  >
    <v-card class="glass-card pa-1 border-thin">
      <v-card-title class="text-h5 text-error font-weight-bold">
        {{ t("admin.users.delete-title") }}
      </v-card-title>
      <v-card-text>
        {{ t("admin.users.delete-description") }}
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          color="secondary"
          rounded="lg"
          variant="text"
          :text="t('admin.users.delete-cancel')"
          @click="showDeleteDialog = false"
        />
        <v-btn
          color="error"
          rounded="lg"
          variant="elevated"
          :text="t('admin.users.delete-confirm')"
          :loading="deleteLoading"
          @click="deleteUser"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import type {
  ComponentInternalInstance,
  Raw,
} from "vue"
import type { UserWithRole } from "better-auth/plugins"

type AdminUser = UserWithRole & {
  username: string;
  displayUsername: string;
}

const store = useMainStore()
const {
  locale,
  t,
} = useI18n()
const { logUiEvent } = useUiEventLogger()
const { smAndUp } = useVDisplay()

const users = ref<AdminUser[]>([])
const userRequests = ref<AdminUserRequest[]>([])
const exporting = ref(false)
const dialogLoading = ref(false)
const deleteLoading = ref(false)
const busyAction = ref<{
  id: string; action: string;
} | null>(null)

const resolvedRequests = ref<Record<string, { message: string }>>({})

const showResolveDialog = ref(false)
const showDismissDialog = ref(false)
const resolveDialogLoading = ref(false)
const dismissDialogLoading = ref(false)
const selectedRequest = ref<AdminUserRequest | null>(null)

const feedback = reactive({
  message: "",
  issue: "",
  color: "info" as "info" | "error" | "success" | "warning",
})

const showUserDialog = ref(false)
const showDeleteDialog = ref(false)
const showPassword = ref(false)
const dialogMode = ref<"create" | "edit">("create")

const userFormRef = ref<{
  validate: () => Promise<string[]>;
  reset: () => Promise<void>;
  resetValidation: () => Promise<void>;
  vm: Raw<ComponentInternalInstance>;
  isValid: boolean | null;
  errorMessages: string[];
}>()

const selectedUser = ref<AdminUser | null>(null)
const originalUsername = ref("")

const userForm = reactive({
  username: "",
  email: "",
  role: "user" as UserType,
  password: "",
  confirmPassword: "",
})

const roleItems: UserType[] = [ "user", "admin" ]

const isCreating = computed(() => dialogMode.value === "create")
const hasUserRequests = computed(() => userRequests.value.length > 0)

function isRequestStale(requestDate: string | Date): boolean {
  const date = typeof requestDate === "string"
    ? new Date(requestDate)
    : requestDate
  const now = Date.now()
  const diffMs = now - date.getTime()
  const weekMs = 7 * 24 * 60 * 60 * 1000

  return diffMs >= weekMs
}

const userRequestsIconColor = computed(() => {
  if (!hasUserRequests.value) {
    return "secondary"
  }

  const hasStale = userRequests.value.some((request) => isRequestStale(request.request_date))

  return hasStale
    ? "error"
    : "warning"
})

async function usernameAvailable(name: string) {
  const normalized = name.trim()

  if (!normalized) {
    return false
  }

  if (!isCreating.value && normalized === originalUsername.value) {
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

const emailRules = [
  (v: unknown) => !!v || t("rules.email.required"),
  (v: string) => (v && (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(v)) || t("rules.email.valid"),
]

const usernameRules = [
  (v: unknown) => !!v || t("rules.username.required"),
  (v: string) => (v && v.trim().length >= 3) || t("rules.username.min", { min: 3 }),
  (v: string) => (v && v.trim().length <= 128) || t("rules.username.max", { max: 128 }),
  (v: string) => (v && (/^[a-zA-Z0-9_]+$/).test(v.trim())) || t("rules.username.alphanumeric"),
  async (v: string) => (v && await usernameAvailable(v)) || t("rules.username.already-taken"),
]

const passwordRules = [
  (v: unknown) => !!v || t("rules.password.required"),
  (v: string) => (v && v.length >= 8) || t("rules.password.min", { min: 8 }),
  (v: string) => (v && v.length <= 16384) || t("rules.password.max", { max: 16384 }),
  (v: string) => (v && (/[a-z]/).test(v)) || t("rules.password.lowercase"),
  (v: string) => (v && (/[A-Z]/).test(v)) || t("rules.password.uppercase"),
  (v: string) => (v && (/\d/).test(v)) || t("rules.password.number"),
  (v: string) => (v && (/[^a-zA-Z0-9]/).test(v)) || t("rules.password.special"),
]

const optionalPasswordRules = [
  (v: string) => (!v || v.length >= 8) || t("rules.password.min", { min: 8 }),
  (v: string) => (!v || v.length <= 16384) || t("rules.password.max", { max: 16384 }),
  (v: string) => (!v || (/[a-z]/).test(v)) || t("rules.password.lowercase"),
  (v: string) => (!v || (/[A-Z]/).test(v)) || t("rules.password.uppercase"),
  (v: string) => (!v || (/\d/).test(v)) || t("rules.password.number"),
  (v: string) => (!v || (/[^a-zA-Z0-9]/).test(v)) || t("rules.password.special"),
]

const passwordFieldRules = computed(() => (isCreating.value
  ? passwordRules
  : optionalPasswordRules))

const confirmPasswordRules = computed(() => (isCreating.value
  ? [
      (v: string) => !!v || t("rules.password.required"),
      (v: string) => v === userForm.password || t("rules.password.match"),
    ]
  : [(v: string) => (!userForm.password || v === userForm.password) || t("rules.password.match")]))

function resetFeedback() {
  feedback.message = ""
  feedback.issue = ""
  feedback.color = "info"
}

function applyError(error: {
  message?: string; statusText?: string; code?: string;
}) {
  feedback.color = "error"
  feedback.message = error.message ?? error.code ?? t("error.unknown")
  feedback.issue = error.statusText ?? ""
}

function applySuccess(message: string) {
  feedback.color = "success"
  feedback.message = message
  feedback.issue = ""
}

function isBusy(id: string, action: string) {
  return busyAction.value?.id === id
    && busyAction.value?.action === action
}

function formatUserLabel(userItem: AdminUser) {
  return userItem.displayUsername
    || userItem.username
    || userItem.name
    || userItem.id
}

function formatRole(role: AdminUser["role"]) {
  if (!role) {
    return "user"
  }

  if (Array.isArray(role)) {
    return role.join(", ")
  }

  return role
}

function formatRequestUser(request: AdminUserRequest) {
  return request.user_display_username
    || request.user_username
    || request.user_name
    || request.user_id
}

function formatRequestType(type: AdminUserRequest["type"]) {
  return type === "export"
    ? t("admin.user-requests.type-export")
    : t("admin.user-requests.type-delete")
}

function formatRequestDate(value: string | Date) {
  const date = typeof value === "string"
    ? new Date(value)
    : value

  return date.toLocaleString()
}

function coerceRole(role: AdminUser["role"]): UserType {
  if (Array.isArray(role)) {
    return role.includes("admin")
      ? "admin"
      : "user"
  }

  return role === "admin"
    ? "admin"
    : "user"
}

function getUserSortName(userItem: AdminUser) {
  return userItem.displayUsername
    || userItem.username
    || userItem.name
    || userItem.id
}

function getUserRoleOrder(userItem: AdminUser) {
  return coerceRole(userItem.role) === "admin"
    ? 0
    : 1
}

function sortUsers(items: AdminUser[]) {
  return items.toSorted((left, right) => {
    const roleOrder = getUserRoleOrder(left) - getUserRoleOrder(right)

    if (roleOrder !== 0) {
      return roleOrder
    }

    return getUserSortName(left)
      .localeCompare(getUserSortName(right), locale.value, {
        sensitivity: "base",
      })
  })
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function resetUserForm() {
  userForm.username = ""
  userForm.email = ""
  userForm.role = "user"
  userForm.password = ""
  userForm.confirmPassword = ""
}

async function fetchUsers() {
  resetFeedback()

  const {
    data, error,
  } = await authClient.admin.listUsers({
    query: {
      limit: 200,
      sortBy: "name",
      sortDirection: "asc",
    },
  })

  if (error) {
    applyError(error)
    users.value = []

    return
  }

  const mutatedUsers = (data?.users ?? []).map((user) => Object.assign(user, {
    username: user.name,
    displayUsername: user.name,
  }))

  users.value = sortUsers(mutatedUsers)
}

async function fetchUserRequests() {
  resetFeedback()

  try {
    const response = await $fetch("/api/admin/userRequests")

    userRequests.value = response.body.requests ?? []
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string; code?: string;
    })
    userRequests.value = []
  }
}

function removeResolvedRequest(requestId: string) {
  userRequests.value = userRequests.value.filter((request) => request.id !== requestId)
  const {
    [requestId]: _removed, ...rest
  } = resolvedRequests.value

  resolvedRequests.value = rest
}

async function resolveUserRequest(request: AdminUserRequest) {
  resetFeedback()
  busyAction.value = {
    id: request.id,
    action: request.type === "export"
      ? "resolve-export"
      : "resolve-delete",
  }

  const start = performance.now()

  try {
    await $fetch("/api/admin/userRequests/resolve", {
      method: "POST",
      body: {
        requestId: request.id,
        action: request.type,
      },
    })

    resolvedRequests.value = {
      ...resolvedRequests.value,
      [request.id]: {
        message: t("admin.user-requests.resolved"),
      },
    }

    if (request.type === "delete") {
      users.value = sortUsers(users.value.filter((userItem) => userItem.id !== request.user_id))
    }

    void logUiEvent({
      action: "admin.userRequest.resolve",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        request_id: request.id,
        request_type: request.type,
        user_id: request.user_id,
      },
    })

    setTimeout(() => {
      removeResolvedRequest(request.id)
    }, 5000)
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string; code?: string;
    })

    void logUiEvent({
      action: "admin.userRequest.resolve",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        request_id: request.id,
        request_type: request.type,
        user_id: request.user_id,
      },
    })
  } finally {
    busyAction.value = null
  }
}

function openResolveDialog(request: AdminUserRequest) {
  selectedRequest.value = request
  showResolveDialog.value = true
}

async function confirmResolveRequest() {
  if (!selectedRequest.value) {
    return
  }

  resolveDialogLoading.value = true
  const request = selectedRequest.value

  try {
    await resolveUserRequest(request)
    showResolveDialog.value = false
    selectedRequest.value = null
  } finally {
    resolveDialogLoading.value = false
  }
}

function openDismissDialog(request: AdminUserRequest) {
  selectedRequest.value = request
  showDismissDialog.value = true
}

async function confirmDismissRequest() {
  if (!selectedRequest.value) {
    return
  }

  resetFeedback()
  dismissDialogLoading.value = true
  busyAction.value = {
    id: selectedRequest.value.id,
    action: "dismiss",
  }

  const start = performance.now()
  const request = selectedRequest.value

  try {
    await $fetch("/api/admin/userRequests/delete", {
      method: "POST",
      body: {
        requestId: request.id,
      },
    })

    resolvedRequests.value = {
      ...resolvedRequests.value,
      [request.id]: {
        message: t("admin.user-requests.dismissed"),
      },
    }

    void logUiEvent({
      action: "admin.userRequest.dismiss",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        request_id: request.id,
        request_type: request.type,
        user_id: request.user_id,
      },
    })

    showDismissDialog.value = false
    selectedRequest.value = null

    setTimeout(() => {
      removeResolvedRequest(request.id)
    }, 5000)
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string; code?: string;
    })

    void logUiEvent({
      action: "admin.userRequest.dismiss",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        request_id: request.id,
        request_type: request.type,
        user_id: request.user_id,
      },
    })
  } finally {
    dismissDialogLoading.value = false
    busyAction.value = null
  }
}

function openCreateDialog() {
  resetFeedback()
  selectedUser.value = null
  originalUsername.value = ""
  dialogMode.value = "create"
  resetUserForm()
  showUserDialog.value = true
}

function openEditDialog(userItem: AdminUser) {
  resetFeedback()
  selectedUser.value = userItem
  originalUsername.value = (userItem.displayUsername || userItem.username || userItem.name || "").trim()
  dialogMode.value = "edit"
  userForm.username = userItem.displayUsername || userItem.username || userItem.name || ""
  userForm.email = userItem.email ?? ""
  userForm.role = coerceRole(userItem.role)
  userForm.password = ""
  userForm.confirmPassword = ""
  showUserDialog.value = true
}

async function closeUserDialog() {
  showUserDialog.value = false
  originalUsername.value = ""
  resetUserForm()
  await userFormRef.value?.reset()
  await userFormRef.value?.resetValidation()
}

async function submitUser() {
  resetFeedback()
  dialogLoading.value = true

  await userFormRef.value?.validate()

  if (userFormRef.value?.isValid === false) {
    dialogLoading.value = false

    return
  }

  try {
    if (isCreating.value) {
      const {
        error, data,
      } = await authClient.admin.createUser({
        email: userForm.email.trim(),
        password: userForm.password,
        name: userForm.username.trim(),
        role: userForm.role,
        data: {
          username: userForm.username.trim(),
          displayUsername: userForm.username.trim(),
          emailVerified: true,
        },
      })

      if (error) {
        applyError(error)

        return
      }

      let createdUserId = (data as { user?: { id?: string } } | null)?.user?.id ?? null

      if (!createdUserId) {
        await fetchUsers()
        createdUserId = users.value.find((entry) => entry.email === userForm.email.trim())?.id ?? null
      }

      if (createdUserId) {
        await authClient.admin.updateUser({
          userId: createdUserId,
          data: {
            username: userForm.username.trim(),
            displayUsername: userForm.username.trim(),
            name: userForm.username.trim(),
            email: userForm.email.trim(),
          },
        })
      }

      applySuccess(t("admin.users.create-success"))
    } else if (selectedUser.value) {
      const updatePayload = {
        username: userForm.username.trim(),
        displayUsername: userForm.username.trim(),
        name: userForm.username.trim(),
        email: userForm.email.trim(),
      }

      const { error: updateError } = await authClient.admin.updateUser({
        userId: selectedUser.value.id,
        data: updatePayload,
      })

      if (updateError) {
        applyError(updateError)

        return
      }

      const { error: roleError } = await authClient.admin.setRole({
        userId: selectedUser.value.id,
        role: userForm.role,
      })

      if (roleError) {
        applyError(roleError)

        return
      }

      if (userForm.password.trim()) {
        const { error: passwordError } = await authClient.admin.setUserPassword({
          userId: selectedUser.value.id,
          newPassword: userForm.password,
        })

        if (passwordError) {
          applyError(passwordError)

          return
        }
      }

      applySuccess(t("admin.users.edit-success"))
    }

    await fetchUsers()
    await closeUserDialog()
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string;
    })
  } finally {
    dialogLoading.value = false
  }
}

function showUserDeleteDialog(userItem: AdminUser) {
  selectedUser.value = userItem
  showDeleteDialog.value = true
}

async function deleteUser() {
  if (!selectedUser.value) {
    return
  }

  resetFeedback()
  deleteLoading.value = true

  try {
    const { error } = await authClient.admin.removeUser({
      userId: selectedUser.value.id,
    })

    if (error) {
      applyError(error)

      return
    }

    applySuccess(t("admin.users.delete-success"))
    await fetchUsers()
    showDeleteDialog.value = false
    selectedUser.value = null
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string;
    })
  } finally {
    deleteLoading.value = false
  }
}

async function impersonateUser(userItem: AdminUser) {
  resetFeedback()
  busyAction.value = {
    id: userItem.id, action: "impersonate",
  }

  try {
    const { error } = await authClient.admin.impersonateUser({
      userId: userItem.id,
    })

    if (error) {
      applyError(error)

      return
    }

    applySuccess(t("admin.users.impersonate-success", { username: formatUserLabel(userItem) }))
    await authClient.getSession({
      query: { disableCookieCache: true },
    })
    setTimeout(async () => {
      await navigateTo("/account", { external: true })
    }, 5000)
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string;
    })
  } finally {
    busyAction.value = null
  }
}

async function downloadUserExport(userItem: AdminUser) {
  resetFeedback()
  busyAction.value = {
    id: userItem.id, action: "export",
  }

  const start = performance.now()

  try {
    const response = await $fetch("/api/admin/userExport", {
      params: {
        userId: userItem.id,
      },
    })

    const binaryString = atob(response.body)
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i += 1) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const blob = new Blob([bytes], { type: "application/zip" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")

    a.href = url
    a.download = response.filename
    a.click()
    window.URL.revokeObjectURL(url)
    applySuccess(t("admin.users.export-success", { username: formatUserLabel(userItem) }))

    void logUiEvent({
      action: "admin.userExport",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        user_id: userItem.id,
      },
    })
  } catch (error) {
    applyError(error as {
      message?: string; statusText?: string;
    })

    void logUiEvent({
      action: "admin.userExport",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        user_id: userItem.id,
      },
    })
  } finally {
    busyAction.value = null
  }
}

async function downloadBackup(format: ExportFormat) {
  const start = performance.now()

  try {
    exporting.value = true
    const response = await $fetch("/api/admin/dbExport", {
      params: { format },
    })

    const binaryString = atob(response.body)
    const len = binaryString.length
    const bytes = new Uint8Array(len)

    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const blob = new Blob([bytes])

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")

    a.href = url
    a.download = response.filename
    a.click()
    window.URL.revokeObjectURL(url)

    void logUiEvent({
      action: "admin.dbExport",
      duration_ms: Math.round(performance.now() - start),
      outcome: "success",
      meta: {
        format,
      },
    })
  } catch (error) {
    void logUiEvent({
      action: "admin.dbExport",
      duration_ms: Math.round(performance.now() - start),
      outcome: "error",
      meta: {
        format,
      },
    })
  } finally {
    exporting.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchUsers(),
    fetchUserRequests(),
  ])
})
</script>

<style lang="scss" scoped>
.glass-accordion :deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}

.transparent-panel {
  background: rgba(var(--v-theme-surface), 0.6) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.05);
}

.glass-list-item {
  border: 1px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(var(--v-theme-primary), 0.2);
  }
}
</style>
